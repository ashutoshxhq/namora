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
    BasicProperties, Connection, ConnectionProperties,
};
use namora_core::types::{
    error::Error,
    message::{Context, ExecutionContext, Message, MessageWithContext},
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

pub async fn generic_agent_socket(
    _app: NamoraAIState,
    socket: WebSocket,
    claims: Claims,
    auth_token: String,
) -> Result<(), Error> {
    tracing::info!("Starting generic agent socket");

    tracing::info!("Splitting socket into tx and rx");
    let (mut socket_tx, mut socket_rx) = socket.split();
    tracing::info!("Creating channel to send messages to task orchestrator or user");
    let (tx, mut rx) = mpsc::channel::<MessageWithContext>(32);

    tracing::info!("Setting up a connection to rabbitmq broker");
    let uri = std::env::var("TASK_ORCHESTRATION_BROKER_URI")?;
    let options = ConnectionProperties::default()
        .with_executor(tokio_executor_trait::Tokio::current())
        .with_reactor(tokio_reactor_trait::Tokio);
    let connection = Connection::connect(&uri, options).await?;
    let channel = connection.create_channel().await?;
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

    tracing::info!("Binding queue to recieve messages from task orchestrator");
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

    tracing::info!("Creating a message context to store session data");
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

    // Create a worker to Health check ping message every 2 second
    tracing::info!("Creating a worker to send ping message every 2 seconds");
    let socket_health_check_worker_session_context_mutex = session_context_mutex.clone();
    let socket_health_check_worker_worker_tx: mpsc::Sender<MessageWithContext> = tx.clone();
    let mut socket_health_check_worker = tokio::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            let context = {
                let context = socket_health_check_worker_session_context_mutex
                    .lock()
                    .await;
                context.clone()
            };
            let message_with_context = MessageWithContext {
                message: Message {
                    reciever: "user_ping".to_string(),
                    message_type: "ping".to_string(),
                    content: "Hello".to_string(),
                    additional_info: None,
                    created_at: Some(chrono::Utc::now()),
                },
                context,
            };
            tracing::info!("Sending ping message to client");
            let res = socket_health_check_worker_worker_tx
                .send(message_with_context)
                .await;
            if let Err(e) = res {
                tracing::error!("Failed to send message to worker, error: {}", e);
            }
        }
    });

    tracing::info!("Creating a worker to send messages to User and Task Orchestrator");
    let message_router_worker_channel = channel.clone();
    let mut message_router_worker = tokio::spawn(async move {
        tracing::info!("Listening for messages from User and Task Orchestrator");
        while let Some(message_with_context) = rx.recv().await {
            tracing::info!("Message recieved");
            if message_with_context.message.reciever == "user" {
                tracing::info!("Sending message to User");
                let user_message = serde_json::to_string(&message_with_context.message);
                match user_message {
                    Ok(user_message) => {
                        let res = socket_tx.send(WSMessage::Text(user_message)).await;
                        if let Err(e) = res {
                            tracing::error!("Error: {}", e);
                        }
                        tracing::info!("Message sent to User");
                    }
                    Err(e) => {
                        tracing::error!("Error: {}", e);
                    }
                }
            } else if message_with_context.message.reciever == "system" {
                tracing::info!("Sending message to Task Orchestrator");
                if let Ok(message_with_context) = serde_json::to_value(message_with_context) {
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
            } else if message_with_context.message.reciever == "user_ping" {
                let res = socket_tx.send(WSMessage::Ping(vec![])).await;
                if let Err(e) = res {
                    tracing::error!("unable to send ping, error: {}", e);
                }
            }
        }
    });

    tracing::info!("Creating a worker to recieve messages from User");
    let socket_reciever_worker_tx: mpsc::Sender<MessageWithContext> = tx.clone();
    let socket_reciever_worker_session_context_mutex = session_context_mutex.clone();
    let mut socket_reciever_worker = tokio::spawn(async move {
        tracing::info!("Listening for messages from User");
        while let Some(Ok(msg)) = socket_rx.next().await {
            tracing::info!("Message recieved from User");
            let res = process_socket_message(msg).await;
            match res {
                Ok(Some(message)) => {
                    tracing::info!("Sending message to task orchestrator");
                    let mut context = {
                        let context = socket_reciever_worker_session_context_mutex.lock().await;
                        context.clone()
                    };
                    context.messages.push(message.clone());
                    let message_with_context: MessageWithContext =
                        MessageWithContext { message, context };
                    if let Err(e) = socket_reciever_worker_tx.send(message_with_context).await {
                        tracing::error!("Error: {}", e);
                    }
                    tracing::info!("Message sent to task orchestrator");
                }
                Ok(None) => {
                    tracing::info!("No message to send to task orchestrator");
                }
                Err(e) => {
                    tracing::error!("Error: {}", e);
                }
            }
        }
    });

    tracing::info!("Creating a worker to recieve messages from Task Orchestrator");
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
                            tracing::info!("Sending message to User");
                            {
                                let mut context = session_context_mutex.lock().await;
                                context.messages = message_with_context.context.messages.clone();
                                context.execution_context =
                                    message_with_context.context.execution_context.clone();
                            }
                            if let Err(e) = tx.send(message_with_context).await {
                                tracing::error!("generic_agent_socket: {}", e);
                            }
                            tracing::info!("Message sent to User");
                        }
                        Err(e) => {
                            tracing::error!("Error: {}", e);
                        }
                    }
                }
                Err(e) => {
                    tracing::error!("Error: {}", e);
                }
            }
        }
    });

    // abort all workers when one of them finishes
    tokio::select! {
        _ = (&mut message_router_worker) => {
            tracing::info!("User worker finished");
            socket_reciever_worker.abort();
            socket_health_check_worker.abort();
            task_orchestrator_reciever_worker.abort();
            tracing::info!("Aborted socket_reciever_worker, socket_health_check_worker and task_orchestrator_reciever_worker workers");
        }
        _ = (&mut socket_reciever_worker) => {
            tracing::info!("Socket worker finished");
            message_router_worker.abort();
            task_orchestrator_reciever_worker.abort();
            socket_health_check_worker.abort();
            tracing::info!("Aborted message_router_worker, socket_health_check_worker and task_orchestrator_reciever_worker workers");
        }
        _ = (&mut task_orchestrator_reciever_worker) => {
            tracing::info!("Health worker finished");
            message_router_worker.abort();
            socket_reciever_worker.abort();
            socket_health_check_worker.abort();
            tracing::info!("Aborted message_router_worker, socket_health_check_worker and socket_reciever_worker workers");
        }
        _ = (&mut socket_health_check_worker) => {
            tracing::info!("Health worker finished");
            message_router_worker.abort();
            socket_reciever_worker.abort();
            task_orchestrator_reciever_worker.abort();
            tracing::info!("Aborted message_router_worker, socket_reciever_worker and task_orchestrator_reciever_worker workers");
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
            channel.close(200, "Bye").await?;
            connection.close(200, "Bye").await?;
        }
        Err(err) => {
            tracing::error!("{:?}", err);
            connection.close(200, "Bye").await?;
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
            tracing::info!("Recieved pong with data: {:?}", v);
            return Ok(None);
        }
        WSMessage::Ping(v) => {
            tracing::info!("Recieved ping with data: {:?}", v);
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
                    tracing::error!(
                        "Failed to deserialize message: {}, error: {}",
                        message,
                        error
                    );
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
