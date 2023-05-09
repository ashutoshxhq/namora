use std::sync::Arc;

use crate::{authz::Claims, state::NamoraAIState};
use axum::extract::ws::{Message as WSMessage, WebSocket};
use futures::{sink::SinkExt, stream::StreamExt};
use lapin::{
    message::Delivery,
    options::{
        BasicAckOptions, BasicConsumeOptions, BasicPublishOptions, QueueDeclareOptions,
        QueueDeleteOptions,
    },
    types::FieldTable,
    BasicProperties,
};
use namora_core::types::{
    error::Error,
    message::{Context, ExecutionContext, Message, MessageWithContext},
};
use serde_json::json;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

pub async fn generic_agent_socket(
    app: NamoraAIState,
    socket: WebSocket,
    claims: Claims,
    auth_token: String,
) -> Result<(), Error> {
    let (mut socket_tx, mut socket_rx) = socket.split();
    let (tx, mut rx) = mpsc::channel::<MessageWithContext>(32);

    let channel = app.channel.clone();
    tracing::info!("Declaring queue to recieve messages from task orchestrator");
    let user_id = claims.namora_user_id;
    match channel
        .queue_declare(
            &format!("namora.user.{}", user_id.to_string()),
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
    {
        Ok(queue) => queue,
        Err(err) => {
            tracing::error!("{:?}", err);
            return Err(err.into());
        }
    };

    let mut consumer = match channel
        .basic_consume(
            &format!("namora.user.{}", user_id.to_string()),
            &format!(
                "namora.user.consumer.{}.{}",
                user_id.to_string(),
                Uuid::new_v4()
            ),
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
    {
        Ok(consumer) => consumer,
        Err(err) => {
            tracing::error!("{:?}", err);
            return Err(err.into());
        }
    };

    let session_context_mutex = Arc::new(Mutex::new(Context {
        user_id: claims.namora_user_id,
        team_id: claims.namora_team_id,
        authorization_token: auth_token,
        session_id: Uuid::new_v4(),
        messages: Vec::new(),
        execution_context: ExecutionContext {
            user_query: None,
            non_deterministic_plan: None,
            deterministic_plan: None,
            executed_actions: Vec::new(),
        },
    }));
    tracing::info!("Sending first message to User");
    let message = json!({
        "reciever": "user",
        "message_type": "response",
        "content": "Hi there, How can I help you today?"
    });
    let res = socket_tx.send(WSMessage::Text(message.to_string())).await;
    if let Err(e) = res {
        tracing::error!("Failed to send first message, error: {}", e);
    }

    let message_router_worker_channel = channel.clone();
    let mut message_router_worker = tokio::spawn(async move {
        while let Some(message_with_context) = rx.recv().await {
            if message_with_context.message.reciever == "user" {
                let user_message = serde_json::to_string(&message_with_context.message);
                match user_message {
                    Ok(user_message) => {
                        let res = socket_tx.send(WSMessage::Text(user_message)).await;
                        if let Err(e) = res {
                            tracing::error!("generic_agent_socket: websocket error: {}", e);
                        }
                    }
                    Err(e) => {
                        tracing::error!("generic_agent_socket: websocket error: {}", e);
                    }
                }
            } else if message_with_context.message.reciever == "system" {
                if let Ok(message_with_context) = serde_json::to_value(message_with_context) {
                    tracing::info!("Sending message to Task Orchestrator");
                    if let Ok(message_with_context) = serde_json::to_vec(&message_with_context) {
                        let task_orchestrator_queue_routing_key =
                            std::env::var("TASK_ORCHESTRATION_QUEUE")
                                .expect("Unable to get task orchestrator queue routing key");
                        let res = message_router_worker_channel
                            .basic_publish(
                                "",
                                &task_orchestrator_queue_routing_key,
                                BasicPublishOptions::default(),
                                &message_with_context,
                                BasicProperties::default(),
                            )
                            .await;
                        match res {
                            Ok(_) => {
                                tracing::info!("Sent message to Task Orchestrator");
                            }
                            Err(err) => {
                                tracing::error!(
                                    "Failed to send message to Task Orchestrator {}",
                                    err
                                );
                            }
                        }
                    } else {
                        tracing::error!("Failed to convert message to bytes");
                    }
                } else {
                    tracing::error!("Failed to serialize message to json");
                }
            }
        }
    });

    let socket_reciever_worker_tx = tx.clone();
    let socket_reciever_worker_session_context_mutex = session_context_mutex.clone();
    let mut socket_reciever_worker = tokio::spawn(async move {
        while let Some(Ok(msg)) = socket_rx.next().await {
            let res = process_socket_message(msg).await;
            match res {
                Ok(Some(message)) => {
                    let mut context = {
                        let context = socket_reciever_worker_session_context_mutex.lock().await;
                        context.clone()
                    };
                    context.messages.push(message.clone());
                    let message_with_context = MessageWithContext { message, context };
                    if let Err(e) = socket_reciever_worker_tx.send(message_with_context).await {
                        tracing::error!("generic_agent_socket: websocket error: {}", e);
                    }
                }
                Ok(None) => {}
                Err(e) => {
                    tracing::error!("generic_agent_socket: websocket error: {}", e);
                }
            }
        }
    });
    let mut task_orchestrator_reciever_worker = tokio::spawn(async move {
        let tx = tx.clone();
        let session_context_mutex = session_context_mutex.clone();
        while let Some(delivery) = consumer.next().await {
            tracing::info!("Recieved message from Task Orchestrator");
            match delivery {
                Ok(delivery) => {
                    let res = process_task_orchestrator_message(delivery).await;
                    match res {
                        Ok(message_with_context) => {
                            {
                                let mut context = session_context_mutex.lock().await;
                                context.messages = message_with_context.context.messages.clone();
                                context.execution_context =
                                    message_with_context.context.execution_context.clone();
                            }
                            if let Err(e) = tx.send(message_with_context).await {
                                tracing::error!("generic_agent_socket: {}", e);
                            }
                        }
                        Err(e) => {
                            tracing::error!("generic_agent_socket: websocket error: {}", e);
                        }
                    }
                }
                Err(e) => {
                    tracing::error!("generic_agent_socket: websocket error: {}", e);
                }
            }
        }
    });

    // abort all workers when one of them finishes
    tokio::select! {
        _ = (&mut message_router_worker) => {
            tracing::info!("User worker finished");
            socket_reciever_worker.abort();
            task_orchestrator_reciever_worker.abort();
            tracing::info!("Aborted socket_reciever_worker and task_orchestrator_reciever_worker workers");
        }
        _ = (&mut socket_reciever_worker) => {
            tracing::info!("Socket worker finished");
            message_router_worker.abort();
            task_orchestrator_reciever_worker.abort();
            tracing::info!("Aborted message_router_worker and task_orchestrator_reciever_worker workers");
        }
        _ = (&mut task_orchestrator_reciever_worker) => {
            tracing::info!("Health worker finished");
            message_router_worker.abort();
            socket_reciever_worker.abort();
            tracing::info!("Aborted message_router_worker and socket_reciever_worker workers");
        }
    };

    match channel
        .queue_delete(
            &format!("namora.user.{}", user_id.to_string()),
            QueueDeleteOptions::default(),
        )
        .await
    {
        Ok(_) => {
            tracing::info!("Deleted queue");
        }
        Err(err) => {
            tracing::error!("{:?}", err);
            return Err(err.into());
        }
    };
    tracing::info!("Finished Execution of Generic Agent");

    Ok(())
}

async fn process_socket_message(msg: WSMessage) -> Result<Option<Message>, Error> {
    match msg {
        WSMessage::Text(data) => {
            println!("Recieved message in user socket with data: {:?}", data);
            let message: Message = serde_json::from_str(&data)?;
            return Ok(Some(message));
        }
        WSMessage::Binary(_data) => {
            tracing::error!("Received binary data, which is not supported");
            return Ok(None);
        }
        WSMessage::Close(close_frame) => {
            if let Some(close_frame) = close_frame {
                tracing::error!(
                    "recieved close with code {} and reason `{}`",
                    close_frame.code,
                    close_frame.reason
                );
            } else {
                tracing::error!("somehow recieved close message without CloseFrame");
            }
            return Err(Error::from("Socket connection closed"));
        }

        WSMessage::Pong(v) => {
            tracing::info!("Reecieved pong with data: {:?}", v);
            return Ok(None);
        }
        WSMessage::Ping(v) => {
            tracing::info!("Reecieved ping with data: {:?}", v);
            return Ok(None);
        }
    };
}

async fn process_task_orchestrator_message(
    delivery: Delivery,
) -> Result<MessageWithContext, Error> {
    if let Err(error) = delivery.ack(BasicAckOptions::default()).await {
        tracing::error!("Failed to ack message: {}", error);
    }
    match String::from_utf8(delivery.data.clone()) {
        Ok(message) => {
            let message_with_context: MessageWithContext = match serde_json::from_str(&(message)) {
                Ok(message) => message,
                Err(error) => {
                    tracing::error!("Failed to deserialize message: {}", error);
                    return Err(error.into());
                }
            };
            Ok(message_with_context)
        }
        Err(error) => {
            tracing::error!("Failed to convert message to string: {}", error);
            return Err(error.into());
        }
    }
}
