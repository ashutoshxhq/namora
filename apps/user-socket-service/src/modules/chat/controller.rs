use crate::state::NamoraAIState;
use serde_json::json;
use tokio::sync::mpsc;

use axum::{response::IntoResponse, Extension};
use axum_typed_websockets::{Message as WebSocketMessage, WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, BasicPublishOptions, QueueDeclareOptions},
    types::FieldTable,
    BasicProperties,
};
use namora_core::types::message::{
    AdditionalInfo, Context, ExecutionContext, Message, MessageWithContext, UserContext,
    UserMessage,
};
use uuid::Uuid;

use super::types::{ClientMsg, ServerMsg};

pub async fn generic_agent(
    Extension(app): Extension<NamoraAIState>,
    ws: WebSocketUpgrade<ServerMsg, ClientMsg>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| generic_agent_socket(socket, app))
}

async fn generic_agent_socket(socket: WebSocket<ServerMsg, ClientMsg>, app: NamoraAIState) {
    let user_id: Uuid;
    let user_context: UserContext;
    let (user_msg_tx, mut user_msg_rx) = mpsc::channel(5);

    let (mut sender, mut receiver) = socket.split();
    // create a channel to revive user messages

    if let Some(Ok(first_message)) = receiver.next().await {
        match first_message {
            WebSocketMessage::Item(ClientMsg::Data(data)) => {
                match serde_json::from_value::<UserMessage>(data) {
                    Ok(first_message) => {
                        user_id = first_message.context.user_id;
                        user_context = first_message.context;
                    }
                    Err(err) => {
                        tracing::error!("Failed to parse first message {}", err);
                        return;
                    }
                }
            }
            _ => {
                tracing::error!("First Message is not a data message");
                return;
            }
        }
    } else {
        tracing::error!("Invalid first message");
        return;
    }

    tracing::info!("sending first message to user");

    let res = user_msg_tx
        .send(WebSocketMessage::Item(ServerMsg::Data(
            serde_json::to_value(json!({
                "context": user_context.clone(),
                "content": "Hi there, How can I help you today?".to_string(),
                "additional_info": {},
                "created_at":chrono::Utc::now(),
                "session_id": "",
            }))
            .unwrap_or_default(),
        )))
        .await;
    if let Err(err) = res {
        tracing::error!("Failed to send first message to user {}", err);
        return;
    }
    tracing::info!("First message sent to user");
    let health_worker_user_msg_tx = user_msg_tx.clone();
    let mut health_worker = tokio::spawn(async move {
        loop {
            tracing::info!("Sending ping message to user");
            let res = health_worker_user_msg_tx
                .send(WebSocketMessage::Ping(vec![]))
                .await;
            if let Err(err) = res {
                tracing::error!("Failed to send ping message to user {}", err);
                break;
            }
            tracing::info!("Ping message sent to user");
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        }
    });

    tracing::info!("Starting user worker to handle sending messages to user");
    let user_worker_channel = app.channel.clone();

    let mut user_worker = tokio::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

        let channel = user_worker_channel.clone();
        // declare a queue
        tracing::info!("Declaring queue for user worker");

        let _queue = match channel
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
                return;
            }
        };

        let consumer = match channel
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
                return;
            }
        };
        let user_msg_tx_clone = user_msg_tx.clone();
        consumer.set_delegate(move |delivery: DeliveryResult| {
            tracing::info!("Recieved a message");
            let user_context = user_context.clone();
            let user_msg_tx = user_msg_tx_clone.clone();
            async move {
                let delivery = match delivery {
                    Ok(Some(delivery)) => delivery,
                    Ok(None) => return,
                    Err(error) => {
                        tracing::error!("Failed to consume queue message {}", error);
                        return;
                    }
                };
                if let Err(error) = delivery.ack(BasicAckOptions::default()).await {
                    tracing::error!("Failed to ack message: {}", error);
                }
                tracing::info!("Got message from task orchestrator");
                match String::from_utf8(delivery.data.clone()) {
                    Ok(message) => {
                        let message_with_context: MessageWithContext =
                            match serde_json::from_str(&(message)) {
                                Ok(message) => message,
                                Err(error) => {
                                    tracing::error!("Failed to deserialize message: {}", error);
                                    return;
                                }
                            };

                        tracing::info!(
                            "Got message from user worker, message: {:?}",
                            message_with_context
                        );

                        tracing::info!("Sending message to user");
                        {
                            let res = user_msg_tx
                                .send(WebSocketMessage::Item(ServerMsg::Data(
                                    serde_json::to_value(UserMessage {
                                        context: user_context.clone(),
                                        content: message_with_context.message.content.clone(),
                                        session_id: message_with_context.context.session_id.clone(),
                                        additional_info: message_with_context
                                            .message
                                            .additional_info
                                            .data
                                            .clone(),
                                        created_at: message_with_context.message.created_at.clone(),
                                    })
                                    .unwrap_or_default(),
                                )))
                                .await;
                            if let Err(err) = res {
                                tracing::error!("Failed to send message to user {}", err);
                                return;
                            }
                        }
                    }
                    Err(error) => {
                        tracing::error!("Failed to convert message to string: {}", error);
                        return;
                    }
                }
            }
        });

        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        }
    });

    tracing::info!("Starting socket worker to handle messages from user");
    let mut socket_worker = tokio::spawn(async move {
        loop {
            let msg = receiver.next().await.unwrap().unwrap();
            let channel = app.channel.clone();
            tracing::info!("Recieved a message in socket_worker");
            match msg {
                WebSocketMessage::Item(ClientMsg::Data(data)) => {
                    println!("{:?}", data);
                    match serde_json::from_value::<UserMessage>(data) {
                        Ok(message) => {
                            tracing::info!("Got message from user, message: {:?}", message);

                            let message_with_context = MessageWithContext {
                                message: Message {
                                    content: message.content,
                                    additional_info: AdditionalInfo {
                                        step: "system:basic_response_or_create_plan".to_string(),
                                        data: message.additional_info,
                                    },
                                    from: "user".to_string(),
                                    to: "system".to_string(),
                                    reply_to: None,
                                    created_at: message.created_at,
                                },
                                context: Context {
                                    execution_context: ExecutionContext {
                                        deterministic_plan: None,
                                        executed_actions: Vec::new(),
                                        non_deterministic_plan: None,
                                        user_query: None,
                                    },
                                    user_id: Some(message.context.user_id),
                                    authorization_token: message.context.authorization_token,
                                    messages: Vec::new(),
                                    session_id: message.session_id,
                                    team_id: Some(message.context.team_id),
                                },
                            };
                            if let Ok(message_json) = serde_json::to_value(message_with_context) {
                                tracing::info!("Sending message to SYSTEM");
                                if let Ok(payload) = serde_json::to_vec(&message_json) {
                                    let task_orchestrator_queue_routing_key = std::env::var(
                                        "TASK_ORCHESTRATION_QUEUE",
                                    )
                                    .expect("Unable to get task orchestrator queue routing key");
                                    let res = channel
                                        .basic_publish(
                                            "",
                                            &task_orchestrator_queue_routing_key,
                                            BasicPublishOptions::default(),
                                            &payload,
                                            BasicProperties::default(),
                                        )
                                        .await;
                                    match res {
                                        Ok(_) => {
                                            tracing::info!("Sent message to SYSTEM");
                                        }
                                        Err(err) => {
                                            tracing::error!(
                                                "Failed to send message to SYSTEM {}",
                                                err
                                            );
                                        }
                                    }
                                } else {
                                    tracing::error!("Failed to serialize message");
                                }
                            } else {
                                tracing::error!("Failed to serialize message");
                            }
                        }
                        Err(_) => {
                            continue;
                        }
                    }
                }
                WebSocketMessage::Close(c) => {
                    if let Some(cf) = c {
                        tracing::info!(
                            "sent close with code {} and reason `{}`",
                            cf.code,
                            cf.reason
                        );
                    } else {
                        tracing::info!("somehow sent close message without CloseFrame");
                    }
                    break;
                }

                WebSocketMessage::Pong(v) => {
                    tracing::info!("recieved pong message {:?}", v);
                }
                WebSocketMessage::Ping(v) => {
                    tracing::info!("recieved ping message {:?}", v);
                }
            };
        }
        tracing::info!("Socket worker finished");
    });

    let mut user_socket_sender_worker = tokio::spawn(async move {
        while let Some(message) = user_msg_rx.recv().await {
            tracing::info!("Sending message to user");
            let res = sender.send(message).await;
            if let Err(err) = res {
                tracing::error!("Failed to send message to user {}", err);
                break;
            }
        }
    });

    // abort all workers when one of them finishes
    tokio::select! {
        _ = (&mut user_worker) => {
            tracing::info!("User worker finished");
            socket_worker.abort();
            health_worker.abort();
            tracing::info!("Aborted socket and health workers");
        }
        _ = (&mut socket_worker) => {
            tracing::info!("Socket worker finished");
            user_worker.abort();
            health_worker.abort();
            tracing::info!("Aborted user and health workers");
        }
        _ = (&mut health_worker) => {
            tracing::info!("Health worker finished");
            user_worker.abort();
            socket_worker.abort();
            tracing::info!("Aborted user and socket workers");
        }
        _ = (&mut user_socket_sender_worker) => {
            tracing::info!("User socket sender worker finished");
            user_worker.abort();
            socket_worker.abort();
            health_worker.abort();
            tracing::info!("Aborted user, socket and health workers");
        }
    };
    tracing::info!("Finished Execution of Controller");
}
