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
    let mut workers = vec![];

    let (conversation_tx, conversation_rx) = channel::<MessageWithConversationContext>();
    let self_tx = conversation_tx.clone();
    let conversation_worker = tokio::spawn(async move {
        loop {
            let recv_data = conversation_rx.recv();
            match recv_data {
                Ok(recv_data) => {
                    if recv_data.message.message_to == "SYSTEM" {
                        let response_message = app.services.chat.chat_system(recv_data).await;
                        match response_message {
                            Ok(res) => match self_tx.send(res) {
                                Ok(_send_res) => {}
                                Err(_err) => {}
                            },
                            Err(_err) => {}
                        }
                    } else if recv_data.message.message_to == "USER" {
                        let res = sender
                            .send(Message::Item(ServerMsg::Data(
                                serde_json::to_value(recv_data).unwrap(),
                            )))
                            .await;
                        match res {
                            Ok(_res) => {}
                            Err(_err) => {}
                        }
                    } else if recv_data.message.message_to == "AI" {
                        let response_message = app.services.chat.chat_ai(recv_data).await;
                        match response_message {
                            Ok(res) => match self_tx.send(res) {
                                Ok(_send_res) => {}
                                Err(_err) => {}
                            },
                            Err(_err) => {}
                        }
                    }
                }
                Err(_err) => {}
            }
        }
    });
    workers.push(conversation_worker);

    let socket_worker = tokio::spawn(async move {
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
    workers.push(socket_worker);
    futures::future::join_all(workers).await;
}
