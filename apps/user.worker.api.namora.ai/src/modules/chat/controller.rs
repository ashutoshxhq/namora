use crate::state::NamoraAIState;
use std::sync::Arc;
use tokio::sync::Mutex;

use axum::{response::IntoResponse, Extension};
use axum_typed_websockets::{Message as WebSocketMessage, WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};
use headers::HeaderMap;
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
};
use namora_core::{
    connector::{send_message_to_ai, send_message_to_system},
    types::message::{
        AdditionalData, ConverationContext, Message, MessageWithConversationContext, QueryContext,
    },
};
use serde_json::json;
use uuid::Uuid;

use super::types::{ClientMsg, ServerMsg};

pub async fn generic_agent(
    Extension(app): Extension<NamoraAIState>,
    ws: WebSocketUpgrade<ServerMsg, ClientMsg>,
    headers: HeaderMap,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| generic_agent_socket(socket, app, headers))
}

async fn generic_agent_socket(
    socket: WebSocket<ServerMsg, ClientMsg>,
    app: NamoraAIState,
    headers: HeaderMap,
) {
    tracing::info!("Starting generic agent socket");
    let message_with_context_global_mutex: Arc<Mutex<MessageWithConversationContext>> =
        Arc::new(Mutex::new(MessageWithConversationContext {
            messages: Vec::new(),
            ai_system_prompt: None,
            context: ConverationContext {
                thread_id: None,
                user_id: None,
                team_id: None,
                current_query_context: QueryContext {
                    executed_actions: Vec::new(),
                    filtered_actions: Vec::new(),
                    messages: Vec::new(),
                    plan: None,
                    query: "".to_string(),
                    unfiltered_actions: Vec::new(),
                },
                past_query_contexts: Vec::new(),
            },
        }));

    tracing::info!("Starting user worker to handle sending messages to user");
    let (mut sender, mut receiver) = socket.split();
    let user_id: Uuid;
    let team_id: Uuid;

    tracing::info!("Getting user_id and team_id from headers");
    let user_id_header = match headers.get("user_id") {
        Some(header) => header,
        None => {
            sender
                .close()
                .await
                .unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    match Uuid::parse_str(user_id_header.to_str().unwrap_or("")) {
        Ok(id) => user_id = id,
        Err(err) => {
            tracing::error!("{:?}", err);
            sender
                .close()
                .await
                .unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    let team_id_header = match headers.get("team_id") {
        Some(header) => header,
        None => {
            sender
                .close()
                .await
                .unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    match Uuid::parse_str(team_id_header.to_str().unwrap_or("")) {
        Ok(id) => team_id = id,
        Err(err) => {
            tracing::error!("{:?}", err);
            sender
                .close()
                .await
                .unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    tracing::info!("Sending welcome message to user");
    if let Err(err) = sender
        .send(WebSocketMessage::Item(ServerMsg::Data(json!([{
            "message_from": "AI",
            "message_to": "USER",
            "next_message_to": "SYSTEM",
            "message": "Hi there, How can I help you today?",
            "additional_data": {},
            "created_at": ""
        }]))))
        .await
    {
        tracing::error!("{:?}", err);
    }

    tracing::info!("Starting user worker to handle sending messages to user");
    let user_worker_channel = app.channel.clone();

    let message_with_context_global_mutex_clone = message_with_context_global_mutex.clone();
    let user_worker = tokio::spawn(async move {
        let channel = user_worker_channel.clone();
        // declare a queue
        tracing::info!("Declaring queue for user worker");

        let _queue = match channel
            .queue_declare(
                "amq.queue.worker.system",
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
                "amq.queue.worker.system",
                "system_worker",
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
            let message_with_context_global_mutex = message_with_context_global_mutex_clone.clone();
            let sender_mutex = sender_mutex.clone();
            async move {
                let delivery = match delivery {
                    Ok(Some(delivery)) => delivery,
                    Ok(None) => return,
                    Err(error) => {
                        dbg!("Failed to consume queue message {}", error);
                        return;
                    }
                };
                match String::from_utf8(delivery.data.clone()) {
                    Ok(message) => {
                        let message_with_context: MessageWithConversationContext =
                            match serde_json::from_str(&(message)) {
                                Ok(message) => message,
                                Err(error) => {
                                    dbg!("Failed to deserialize message: {}", error);
                                    return;
                                }
                            };

                        tracing::info!(
                            "Got message from user worker, message: {:?}",
                            message_with_context
                        );

                        {
                            let mut message_with_context_global_mutex_guard =
                                message_with_context_global_mutex.lock().await;
                            *message_with_context_global_mutex_guard = message_with_context.clone();
                        };

                        tracing::info!("Sending message to user");

                        tokio::spawn(async move {
                            let mut sender_mutex_guard = sender_mutex.lock().await;

                            match sender_mutex_guard
                                .send(WebSocketMessage::Item(ServerMsg::Data(
                                    serde_json::to_value(message_with_context.messages)
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
                        dbg!("Failed to convert message to string: {}", error);
                        return;
                    }
                }
            }
        });
    });

    tracing::info!("Starting socket worker to handle messages from user");
    while let Some(Ok(msg)) = receiver.next().await {
        let channel = app.channel.clone();
        tracing::info!("Recieved a message in socket_worker");
        match msg {
            WebSocketMessage::Item(ClientMsg::Data(data)) => {
                println!("{:?}", data);
                match serde_json::from_value::<Message>(data) {
                    Ok(message) => {
                        tracing::info!("Got message from user, message: {:?}", message);
                        let message_with_context_global_mutex_guard_value = {
                            let message_with_context_global_mutex_guard =
                                message_with_context_global_mutex.lock().await;
                            (*message_with_context_global_mutex_guard).clone()
                        };
                        let mut context = ConverationContext {
                            current_query_context: namora_core::types::message::QueryContext {
                                query: message.message.clone(),
                                plan: None,
                                unfiltered_actions: Vec::new(),
                                filtered_actions: Vec::new(),
                                executed_actions: Vec::new(),
                                messages: vec![message.clone()],
                            },
                            past_query_contexts: Vec::new(),
                            team_id: Some(team_id),
                            thread_id: None,
                            user_id: Some(user_id),
                        };

                        let mut ai_system_prompt = None;

                        let mut is_user_feedback_res = false;
                        tracing::info!("Checking if user feedback response");
                        if let Some(_user_id) = message_with_context_global_mutex_guard_value
                            .context
                            .user_id
                        {
                            for msg in message_with_context_global_mutex_guard_value
                                .messages
                                .clone()
                            {
                                if let Some(additional_data) = msg.additional_data {
                                    match serde_json::from_value::<AdditionalData>(additional_data)
                                    {
                                        Ok(additional_data) => {
                                            if additional_data.action
                                                == "user_feedback_response".to_string()
                                            {
                                                is_user_feedback_res = true;
                                            }
                                        }
                                        Err(err) => {
                                            tracing::error!("{:?}", err);
                                        }
                                    }
                                }
                            }
                        }

                        if is_user_feedback_res {
                            tracing::info!("User feedback response");
                            context = message_with_context_global_mutex_guard_value
                                .context
                                .clone();
                            context.current_query_context.messages.push(message.clone());
                            ai_system_prompt = message_with_context_global_mutex_guard_value
                                .ai_system_prompt
                                .clone();
                            let message_to_ai = MessageWithConversationContext {
                                messages: vec![message.clone()],
                                ai_system_prompt,
                                context,
                            };

                            {
                                let mut message_with_context_global_mutex_guard =
                                    message_with_context_global_mutex.lock().await;
                                *message_with_context_global_mutex_guard = message_to_ai.clone();
                            };

                            if let Ok(message) = serde_json::to_value(message_to_ai) {
                                tokio::spawn(async move {
                                    tracing::info!("Sending message to AI");
                                    let res = send_message_to_ai(channel, message).await;
                                    if let Err(err) = res {
                                        tracing::error!("{:?}", err);
                                    }
                                });
                            }
                        } else {
                            tracing::info!("Not user feedback response");
                            context.past_query_contexts =
                                message_with_context_global_mutex_guard_value
                                    .context
                                    .past_query_contexts
                                    .clone();
                            let message_to_system = MessageWithConversationContext {
                                messages: vec![message.clone()],
                                ai_system_prompt,
                                context,
                            };
                            {
                                let mut message_with_context_global_mutex_guard =
                                    message_with_context_global_mutex.lock().await;
                                *message_with_context_global_mutex_guard =
                                    message_to_system.clone();
                            };
                            if let Ok(message_json) = serde_json::to_value(message_to_system) {
                                tokio::spawn(async move {
                                    tracing::info!("Sending message to SYSTEM");
                                    let res = send_message_to_system(channel, message_json).await;
                                    if let Err(err) = res {
                                        tracing::error!("{:?}", err);
                                    }
                                });
                            }
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
