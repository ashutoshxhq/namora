mod actions;
mod handler;
mod types;
use std::{
    sync::{Arc, Mutex},
};

use dotenvy::dotenv;
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties,
};
use namora_core::{
    db::create_pool,
    types::{error::Error, message::MessageWithConversationContext, worker::WorkerContext},
};
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .with_level(true)
        .with_line_number(true)
        .with_file(true)
        .with_ansi(false)
        .compact()
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let worker_result = worker().await;

    match worker_result {
        Ok(_) => {}
        Err(_err) => {
            tracing::error!("Error: {:?}", _err);
        }
    }
}

async fn worker() -> Result<(), Error> {
    let pool = create_pool();

    let uri = std::env::var("RABBITMQ_URI")?;
    let options = ConnectionProperties::default()
        // Use tokio executor and reactor.
        // At the moment the reactor is only available for unix.
        .with_executor(tokio_executor_trait::Tokio::current())
        .with_reactor(tokio_reactor_trait::Tokio);

    let connection = Connection::connect(&uri, options).await.unwrap();
    let channel = connection.create_channel().await.unwrap();

    let _queue = channel
        .queue_declare(
            "amq.queue.worker.system",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .unwrap();

    let consumer = channel
        .basic_consume(
            "amq.queue.worker.system",
            "system_worker",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .unwrap();

    let worker_context = Arc::new(Mutex::new(WorkerContext {
        pool: pool.clone(),
        channel: channel.clone(),
    }));

    consumer.set_delegate(move |delivery: DeliveryResult| {
        let worker_context_mutex = Arc::clone(&worker_context);
        async move {
            let delivery = match delivery {
                Ok(Some(delivery)) => delivery,
                Ok(None) => return,
                Err(error) => {
                    dbg!("Failed to consume queue message {}", error);
                    return;
                }
            };

            let worker_ctx = {
                let worker_ctx_guard = worker_context_mutex.lock().unwrap();
                (*worker_ctx_guard).clone()
            };
            // Do something with the delivery data (The message payload)
            let message: MessageWithConversationContext =
                serde_json::from_str(&String::from_utf8(delivery.data.clone()).unwrap()).unwrap();

            let _message_handler_res = handler::message_handler(worker_ctx, message).await.unwrap();

            delivery
                .ack(BasicAckOptions::default())
                .await
                .expect("Failed to ack message");
        }
    });
    Ok(())
}
