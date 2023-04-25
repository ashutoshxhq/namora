use std::sync::{Arc, Mutex};

use crate::state::NamoraAIState;

use amqprs::channel::{
    BasicAckArguments, BasicConsumeArguments, QueueBindArguments, QueueDeclareArguments,
};
use axum::{response::IntoResponse, Extension};
use axum_typed_websockets::{Message as WebSocketMessage, WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};
use headers::HeaderMap;
use namora_core::{
    connector::send_message_to_system,
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
    let message_with_context_global: Arc<Mutex<MessageWithConversationContext>> =
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

    let (mut sender, mut receiver) = socket.split();
    let user_id: Uuid;
    let team_id: Uuid;

    let user_id_header = match headers.get("user_id") {
        Some(header) => header,
        None => {
            sender.close().await.unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    user_id = match Uuid::parse_str(user_id_header.to_str().unwrap_or("")) {
        Ok(id) => id,
        Err(err) => {
            tracing::error!("{:?}", err);
            sender.close().await.unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    let team_id_header = match headers.get("team_id") {
        Some(header) => header,
        None => {
            sender.close().await.unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    team_id = match Uuid::parse_str(team_id_header.to_str().unwrap_or("")) {
        Ok(id) => id,
        Err(err) => {
            tracing::error!("{:?}", err);
            sender.close().await.unwrap_or_else(|err| tracing::error!("{:?}", err));
            return;
        }
    };

    sender
        .send(WebSocketMessage::Item(ServerMsg::Data(json!([{
            "message_from": "AI",
            "message_to": "USER",
            "next_message_to": "SYSTEM",
            "message": "Hi there, How can I help you today?",
            "additional_data": {},
            "created_at": ""
        }]))))
        .await
        .ok();

    tracing::info!("Starting user worker to handle sending messages to user");
    let user_worker_channel = app.channel.clone();

    let user_worker_message_with_context_global = message_with_context_global.clone();
    let user_worker = tokio::spawn(async move {
        let channel = user_worker_channel.clone();
        // declare a queue
        if let Ok(res) = channel
            .queue_declare(QueueDeclareArguments::default())
            .await
        {
            if let Some((queue_name, _, _)) = res {
                // bind the queue to exchange
                let routing_key = format!("amqprs.worker.user.{}", user_id);
                if let Ok(exchange_name) = std::env::var("RABBITMQ_EXCHANGE_NAME") {
                    if let Ok(_) = channel
                        .queue_bind(QueueBindArguments::new(
                            &queue_name,
                            &exchange_name,
                            &routing_key,
                        ))
                        .await
                    {
                        let args =
                            BasicConsumeArguments::new(&queue_name, &user_id.to_string());
                        if let Ok((_ctag, mut messages_rx)) = channel.basic_consume_rx(args).await {
                            while let Some(msg) = messages_rx.recv().await {
                                if let Some(message_bytes) = msg.content {
                                    match String::from_utf8(message_bytes.clone()) {
                                        Ok(message_str) => {
                                            match serde_json::from_str::<
                                                MessageWithConversationContext,
                                            >(
                                                &message_str
                                            ) {
                                                Ok(message_with_context) => {
                                                    for message in
                                                        &message_with_context.messages
                                                    {
                                                        if let Some(additional_data) =
                                                            message
                                                                .additional_data
                                                                .clone()
                                                        {
                                                            let additional_data: AdditionalData = serde_json::from_value(additional_data).unwrap();
                                                            if additional_data.action
                                                                == "get_user_feedback"
                                                            {
                                                            }
                                                        }
                                                    }

                                                    let message_with_context_to_copy =
                                                        message_with_context.clone();
                                                    let message_with_context_global =
                                                    user_worker_message_with_context_global
                                                            .clone();
                                                    tokio::spawn(async move {
                                                        let mut
                                                        message_with_context_global =
                                                            message_with_context_global
                                                                .lock()
                                                                .unwrap();
                                                        *message_with_context_global = message_with_context_to_copy.clone();
                                                    });

                                                    let res = sender
                                                        .send(WebSocketMessage::Item(
                                                            ServerMsg::Data(
                                                                serde_json::to_value(
                                                                    message_with_context
                                                                        .messages,
                                                                )
                                                                .unwrap_or_default(),
                                                            ),
                                                        ))
                                                        .await;
                                                    if let Err(err) = res {
                                                        tracing::error!("{:?}", err);
                                                        continue;
                                                    } else if let Some(delivery) = msg.deliver {
                                                        let delivery_tag = delivery.delivery_tag();
                                                        let _ = channel
                                                            .basic_ack(BasicAckArguments {
                                                                delivery_tag,
                                                                multiple: false,
                                                            })
                                                            .await;
                                                    }
                                                }
                                                Err(err) => {
                                                    tracing::error!("{:?}", err);
                                                    continue;
                                                }
                                            }
                                        }
                                        Err(err) => {
                                            tracing::error!("{:?}", err);
                                            continue;
                                        }
                                    }
                                } else {
                                    tracing::error!("Unable to read message bytes");
                                    continue;
                                }
                            }
                        } else {
                            tracing::error!("Unable to consume messages");
                        }
                    } else {
                        tracing::error!("Unable to bind queue");
                    }
                } else {
                    tracing::error!("Unable to read RABBITMQ_EXCHANGE_NAME");
                }
            } else {
                tracing::error!("Unable to declare queue");
            }
        } else {
            tracing::error!("Unable to declare queue");
        }
    });

    while let Some(Ok(msg)) = receiver.next().await {
        let channel = app.channel.clone();
        tracing::info!("Recieved a message in socket_worker");
        match msg {
            WebSocketMessage::Item(ClientMsg::Data(data)) => {
                println!("{:?}", data);
                match serde_json::from_value::<Message>(data) {
                    Ok(message) => {
                        let message_with_context_global = message_with_context_global.clone();
                        let message_with_context_clone = message_with_context_global.clone();
                        let message_with_context_value = message_with_context_clone.lock().unwrap();

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

                        if let Some(_user_id) = message_with_context_value.context.user_id {
                            context = (*message_with_context_value).context.clone();
                            context.current_query_context.messages.push(message.clone());
                            ai_system_prompt = message_with_context_value.ai_system_prompt.clone();
                        }

                        let message_to_system = MessageWithConversationContext {
                            messages: vec![message.clone()],
                            ai_system_prompt,
                            context,
                        };

                        let message_with_context_to_copy = message_to_system.clone();
                        tokio::spawn(async move {
                            let mut message_with_context_clone =
                                message_with_context_global.lock().unwrap();
                            *message_with_context_clone = message_with_context_to_copy.clone();
                        });

                        if let Ok(message_json) = serde_json::to_value(message_to_system) {
                            tokio::spawn(async move {
                                let res = send_message_to_system(channel, message_json).await;
                                if let Err(err) = res {
                                    tracing::error!("{:?}", err);
                                }
                            });
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

    if let Err(err) = app.channel.close().await {
        tracing::error!("{:?}", err);
    }
    user_worker.abort();
}
