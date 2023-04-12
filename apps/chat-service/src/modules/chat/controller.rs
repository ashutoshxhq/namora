use crate::state::ExecuteAIState;

use super::dto::{
    ClientMsg, ConverationContext, ConverationHistory, MessageWithConversationContext, Msg,
    ServerMsg,
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

    let (openai_assistant_tx, openai_assistant_rx) = channel::<MessageWithConversationContext>();
    let (system_tx, system_rx) = channel::<MessageWithConversationContext>();
    let (user_tx, user_rx) = channel::<MessageWithConversationContext>();

    let openai_to_system_tx = system_tx.clone();
    let openai_to_user_tx = user_tx.clone();
    let openai_to_chat_service = app.services.chat.clone();
    let openai_assistant_worker = tokio::spawn(async move {
        loop {
            let recv_data = openai_assistant_rx.recv();
            match recv_data {
                Ok(recv_data) => {
                    let response_message = openai_to_chat_service.chat_openai(recv_data).await;
                    match response_message {
                        Ok(res) => match res.message.clone() {
                            Msg::Query(data) => {
                                if data.query_to == "SYSTEM" {
                                    match openai_to_system_tx.send(res) {
                                        Ok(_openai_to_system_res) => {}
                                        Err(_err) => {}
                                    }
                                } else if data.query_to == "USER" {
                                    match openai_to_user_tx.send(res) {
                                        Ok(_openai_to_user_res) => {}
                                        Err(_err) => {}
                                    }
                                }
                            }
                            Msg::Response(data) => {
                                if data.response_to == "SYSTEM" {
                                    match openai_to_system_tx.send(res) {
                                        Ok(_openai_to_system_res) => {}
                                        Err(_err) => {}
                                    }
                                } else if data.response_to == "USER" {
                                    match openai_to_user_tx.send(res) {
                                        Ok(_openai_to_user_res) => {}
                                        Err(_err) => {}
                                    }
                                }
                            }
                        },
                        Err(_err) => {}
                    }
                }
                Err(_err) => {}
            }
        }
    });

    let system_to_openai_tx = openai_assistant_tx.clone();
    let system_to_user_tx = user_tx.clone();
    let system_to_chat_service = app.services.chat.clone();
    let system_worker = tokio::spawn(async move {
        loop {
            let message_data = system_rx.recv().unwrap();
            let response_message = system_to_chat_service
                .chat_system(message_data)
                .await
                .unwrap();

            match response_message.message.clone() {
                Msg::Query(data) => {
                    if data.query_to == "OPENAI" {
                        system_to_openai_tx.send(response_message).unwrap();
                    } else if data.query_to == "USER" {
                        system_to_user_tx.send(response_message).unwrap();
                    }
                }
                Msg::Response(data) => {
                    if data.response_to == "OPENAI" {
                        system_to_openai_tx.send(response_message).unwrap();
                    } else if data.response_to == "USER" {
                        system_to_user_tx.send(response_message).unwrap();
                    }
                }
            }
        }
    });

    let user_worker = tokio::spawn(async move {
        loop {
            let data = user_rx.recv().unwrap();
            sender
                .send(Message::Item(ServerMsg::Data(
                    serde_json::to_value(data.message).unwrap(),
                )))
                .await
                .ok();
        }
    });

    tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Item(ClientMsg::Data(data)) => {
                    system_tx
                        .send(MessageWithConversationContext {
                            message: Msg::Query(serde_json::from_value(data).unwrap()),
                            openai_system_prompt: None,
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
                        println!(
                            ">>> sent close with code {} and reason `{}`",
                            cf.code, cf.reason
                        );
                    } else {
                        println!(">>> somehow sent close message without CloseFrame");
                    }
                    break;
                }

                Message::Pong(v) => {
                    println!(">>> sent pong with {:?}", v);
                }
                Message::Ping(v) => {
                    println!(">>> sent ping with {:?}", v);
                }
            };
        }
    });

    user_worker.abort();
    system_worker.abort();
    openai_assistant_worker.abort();
}
