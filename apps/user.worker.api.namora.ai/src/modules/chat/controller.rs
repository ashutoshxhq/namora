use crate::state::NamoraAIState;

use amqprs::channel::{BasicConsumeArguments, QueueBindArguments, QueueDeclareArguments};
use axum::{response::IntoResponse, Extension};
use axum_typed_websockets::{Message as WebSocketMessage, WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};
use headers::HeaderMap;
use namora_core::{
    connector::send_message_to_system,
    types::message::{ConverationContext, Message, MessageWithConversationContext},
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
    let (mut sender, mut receiver) = socket.split();
    let user_id: Uuid;
    let team_id: Uuid;
    if let Some(user_id_header) = headers.get("user_id") {
        match user_id_header.to_str() {
            Ok(user_id_str) => match Uuid::parse_str(user_id_str) {
                Ok(user_id_uuid) => {
                    user_id = user_id_uuid;
                }
                Err(err) => {
                    tracing::error!("{:?}", err);
                    match sender.close().await{
                        Ok(_) => {},
                        Err(err) => {
                            tracing::error!("{:?}", err);
                        }
                    };
                    return;
                }
            },
            Err(err) => {
                tracing::error!("{:?}", err);
                match sender.close().await{
                    Ok(_) => {},
                    Err(err) => {
                        tracing::error!("{:?}", err);
                    }
                };
                return;
            }
        }
    } else {
        match sender.close().await{
            Ok(_) => {},
            Err(err) => {
                tracing::error!("{:?}", err);
            }
        };
        return;
    }

    if let Some(team_id_header) = headers.get("team_id") {
        match team_id_header.to_str() {
            Ok(team_id_str) => match Uuid::parse_str(team_id_str) {
                Ok(team_id_uuid) => {
                    team_id = team_id_uuid;
                }
                Err(err) => {
                    tracing::error!("{:?}", err);
                    match sender.close().await{
            Ok(_) => {},
            Err(err) => {
                tracing::error!("{:?}", err);
            }
        };
                    return;
                }
            },
            Err(err) => {
                tracing::error!("{:?}", err);
                match sender.close().await{
            Ok(_) => {},
            Err(err) => {
                tracing::error!("{:?}", err);
            }
        };
                return;
            }
        }
    } else {
        match sender.close().await{
            Ok(_) => {},
            Err(err) => {
                tracing::error!("{:?}", err);
            }
        };
        return;
    }

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

    let user_worker = tokio::spawn(async move {
        let channel = user_worker_channel.clone();
        // declare a queue
        let (queue_name, _, _) = channel
            .queue_declare(QueueDeclareArguments::default())
            .await
            .unwrap()
            .unwrap();

        // bind the queue to exchange
        let routing_key = format!("amqprs.worker.user.{}", user_id);
        let exchange_name = std::env::var("RABBITMQ_EXCHANGE_NAME").unwrap();

        channel
            .queue_bind(QueueBindArguments::new(
                &queue_name,
                &exchange_name,
                &routing_key,
            ))
            .await
            .unwrap();

        let args = BasicConsumeArguments::new(&queue_name, &user_id.to_string());
        let (_ctag, mut messages_rx) = channel.basic_consume_rx(args).await.unwrap();

        while let Some(msg) = messages_rx.recv().await {
            let message_bytes = msg.content.unwrap();
            let message_str = String::from_utf8(message_bytes.clone()).unwrap();
            let message_with_context: MessageWithConversationContext =
                serde_json::from_str(&message_str).unwrap();
            let res = sender
                .send(WebSocketMessage::Item(ServerMsg::Data(
                    serde_json::to_value(message_with_context.messages).unwrap(),
                )))
                .await;
            match res {
                Ok(_res) => {}
                Err(_err) => {}
            }
        }
    });

    while let Some(Ok(msg)) = receiver.next().await {
        let channel = app.channel.clone();
        tracing::info!("Recieved a message in socket_worker");
        match msg {
            WebSocketMessage::Item(ClientMsg::Data(data)) => {
                println!("{:?}", data);
                let message: Message = serde_json::from_value(data).unwrap();
                let message_to_system = MessageWithConversationContext {
                    messages: vec![message.clone()],
                    ai_system_prompt: None,
                    context: ConverationContext {
                        current_query_context: namora_core::types::message::QueryContext {
                            query: message.message,
                            plan: None,
                            unfiltered_actions: Vec::new(),
                            filtered_actions: Vec::new(),
                            executed_actions: Vec::new(),
                            messages: Vec::new(),
                        },
                        past_query_contexts: Vec::new(),
                        team_id: Some(team_id),
                        thread_id: None,
                        user_id: Some(user_id),
                    },
                };
                let _res = send_message_to_system(
                    channel,
                    serde_json::to_value(message_to_system).unwrap(),
                )
                .await;
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
