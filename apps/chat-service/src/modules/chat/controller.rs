use crate::state::ExecuteAIState;

use super::dto::{
    ClientMsg, ConverationContext, ConverationHistory, MessageWithConversationContext, ServerMsg,
};
use axum::{response::IntoResponse, Extension};
use axum_typed_websockets::{Message, WebSocket, WebSocketUpgrade};
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::json;
use std::sync::mpsc::channel;

pub async fn generic_agent(
    Extension(app): Extension<ExecuteAIState>,
    ws: WebSocketUpgrade<ServerMsg, ClientMsg>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| generic_agent_socket(socket, app))
}

async fn generic_agent_socket(socket: WebSocket<ServerMsg, ClientMsg>, app: ExecuteAIState) {
    let (mut sender, mut receiver) = socket.split();
    sender
        .send(Message::Item(ServerMsg::Data(json!([ { "response_to": "USER", "response": { "message": "Hi there, How can I help you today ?" } } ]))))
        .await
        .ok();

    let (conversation_tx, conversation_rx) = channel::<MessageWithConversationContext>();
    let (user_tx, user_rx) = channel::<MessageWithConversationContext>();
    let self_tx = conversation_tx.clone();
    tracing::info!("Starting conversation worker to handle conversation thread");
    let mut conversation_worker = tokio::spawn(async move {
        loop {
            let recv_data = conversation_rx.recv();
            tracing::info!("Recieved a new message");
            let chat_service = app.services.chat.clone();
            let message_self_tx = self_tx.clone();
            let message_user_tx = user_tx.clone();
            tracing::info!("Creating a tokio task to handle the message");
            tokio::spawn(async move {
                match recv_data {
                    Ok(recv_data) => {
                        tracing::info!(
                            "Recieved message is from {}, to {}",
                            recv_data.message.message_from,
                            recv_data.message.message_to
                        );
                        if recv_data.message.message_to == "SYSTEM" {
                            tracing::info!("Sending message to SYSTEM message handler");

                            let response_message = chat_service.chat_system(recv_data).await;
                            match response_message {
                                Ok(res) => match message_self_tx.send(res) {
                                    Ok(_send_res) => {}
                                    Err(_err) => {}
                                },
                                Err(_err) => {}
                            }
                        } else if recv_data.message.message_to == "USER" {
                            tracing::info!("Sending message to USER message handler");

                            let res = message_user_tx.send(recv_data);
                            match res {
                                Ok(_res) => {}
                                Err(_err) => {}
                            }
                        } else if recv_data.message.message_to == "AI" {
                            tracing::info!("Sending message to AI message handler");

                            let response_message = chat_service.chat_ai(recv_data).await;
                            match response_message {
                                Ok(res) => match message_self_tx.send(res) {
                                    Ok(_send_res) => {}
                                    Err(_err) => {}
                                },
                                Err(_err) => {}
                            }
                        }
                    }
                    Err(_err) => {}
                }
            });
        }
    });

    tracing::info!("Starting user worker to handle sending messages to user");
    let mut user_worker = tokio::spawn(async move {
        let recv_data = user_rx.recv();
        match recv_data {
            Ok(recv_data) => {
                let res = sender
                    .send(Message::Item(ServerMsg::Data(
                        serde_json::to_value(recv_data).unwrap(),
                    )))
                    .await;
                match res {
                    Ok(_res) => {}
                    Err(_err) => {}
                }
            }
            Err(_err) => {}
        }
    });

    tracing::info!("Starting a socket worker to handle message recieved from user");
    let mut socket_worker = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Item(ClientMsg::Data(data)) => {
                    conversation_tx
                        .send(MessageWithConversationContext {
                            message: serde_json::from_value(data).unwrap(),
                            ai_system_prompt: None,
                            context: ConverationContext {
                                thread_id: None,
                                user_id: None,
                                team_id: None,
                                history: ConverationHistory {
                                    messages: Vec::new(),
                                },
                            },
                        })
                        .unwrap();
                }
                Message::Close(c) => {
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

                Message::Pong(v) => {
                    tracing::info!("sent pong with {:?}", v);
                }
                Message::Ping(v) => {
                    tracing::info!("sent ping with {:?}", v);
                }
            };
        }
    });

    tokio::select! {
        rv_conversation_worker = (&mut conversation_worker) => {
            match rv_conversation_worker {
                Ok(_) => {},
                Err(_err) => {}
            }
            socket_worker.abort();
            user_worker.abort()
        },
        rv_socket_worker = (&mut socket_worker) => {
            match rv_socket_worker {
                Ok(_) => {},
                Err(_err) => {}
            }
            conversation_worker.abort();
            user_worker.abort()
        },
        rv_user_worker = (&mut user_worker) => {
            match rv_user_worker {
                Ok(_) => {},
                Err(_err) => {}
            }
            conversation_worker.abort();
            socket_worker.abort()
        },
    }
}
