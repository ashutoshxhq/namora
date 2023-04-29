use crate::state::NamoraAIState;
use std::sync::Arc;
use tokio::sync::Mutex;

use axum::{response::IntoResponse, Extension};
use axum_typed_websockets::{Message as WebSocketMessage, WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
};
use namora_core::{
    connector::send_message_to_system,
    types::message::{
        AdditionalInfo, Context, ExecutionContext, Message, MessageWithContext, UserContext,
        UserMessage,
    },
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

    let (sender, mut receiver) = socket.split();

    if let Some(Ok(WebSocketMessage::Item(ClientMsg::Data(first_message)))) = receiver.next().await
    {
        match serde_json::from_value::<UserMessage>(first_message) {
            Ok(first_message) => {
                user_id = first_message.context.user_id;
                user_context = first_message.context;
            }
            Err(err) => {
                tracing::error!("Failed to parse first message {}", err);
                return;
            }
        }
    } else {
        tracing::error!("Invalid first message");
        return;
    }

    tracing::info!("Starting user worker to handle sending messages to user");
    let user_worker_channel = app.channel.clone();

    let user_worker = tokio::spawn(async move {
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
                &format!("namora.user.consumer.{}", user_id.to_string()),
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
        let sender_mutex = Arc::new(Mutex::new(sender));
        consumer.set_delegate(move |delivery: DeliveryResult| {
            tracing::info!("Recieved a message");
            let sender_mutex = sender_mutex.clone();
            let user_context = user_context.clone();
            async move {
                let delivery = match delivery {
                    Ok(Some(delivery)) => delivery,
                    Ok(None) => return,
                    Err(error) => {
                        tracing::error!("Failed to consume queue message {}", error);
                        return;
                    }
                };
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

                        tokio::spawn(async move {
                            let mut sender_mutex_guard = sender_mutex.lock().await;

                            match sender_mutex_guard
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
                                .await
                            {
                                Ok(_) => {
                                    tracing::info!("Sending ack for message");
                                    if let Err(err) = delivery.ack(BasicAckOptions::default()).await
                                    {
                                        tracing::error!("{:?}", err);
                                    }
                                }
                                Err(err) => {
                                    tracing::error!("{:?}", err);
                                }
                            }
                        });
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
    while let Some(Ok(msg)) = receiver.next().await {
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
                                messages: Vec::new(),
                                session_id: message.session_id,
                                team_id: Some(message.context.team_id),
                            },
                        };
                        if let Ok(message_json) = serde_json::to_value(message_with_context) {
                            tracing::info!("Sending message to SYSTEM");
                            let res = send_message_to_system(channel, message_json).await;
                            if let Err(err) = res {
                                tracing::error!("{:?}", err);
                            }
                            tracing::info!("Sent message to SYSTEM");
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
                tracing::info!("sent pong with {:?}", v);
            }
            WebSocketMessage::Ping(v) => {
                tracing::info!("sent ping with {:?}", v);
            }
        };
    }
    user_worker.abort();
}
