mod actions;
mod db;
mod handler;
mod types;
mod plan;
use std::sync::Arc;

use dotenvy::dotenv;
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties,
};
use namora_core::types::{ worker::WorkerContext, message::MessageWithContext};
use tokio::sync::Mutex;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;
use uuid::Uuid;

use crate::db::create_pool;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .with_level(true)
        .with_line_number(true)
        .with_file(true)
        .finish();
    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");
    tracing::info!("Creating database pool");
    let db_url = std::env::var("ENGINE_SERVICE_DATABASE_URL").expect("Unable to get database url");
    let pool = create_pool(db_url).await.unwrap();
    tracing::info!("Created database pool");
    let uri = std::env::var("TASK_ORCHESTRATION_BROKER_URI").unwrap();
    let options = ConnectionProperties::default()
        .with_executor(tokio_executor_trait::Tokio::current())
        .with_reactor(tokio_reactor_trait::Tokio);
    let connection = Connection::connect(&uri, options).await.unwrap();
    let channel = connection.create_channel().await.unwrap();
    let task_orchestrator_queue_routing_key = std::env::var("TASK_ORCHESTRATION_QUEUE")
        .expect("Unable to get task orchestrator queue routing key");
    let _queue = channel
        .queue_declare(
            &task_orchestrator_queue_routing_key,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .unwrap();
    let consumer = channel
        .basic_consume(
            &task_orchestrator_queue_routing_key,
            &format!("namora.svc.task-orchestrator.consumer.{}", Uuid::new_v4().to_string()),
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .unwrap();

    let worker_context = Arc::new(Mutex::new(WorkerContext {
        pool: pool.clone(),
        channel: channel.clone(),
    }));
    tracing::info!("Listning to messages");
    consumer.set_delegate(move |delivery: DeliveryResult| {
        let worker_context_mutex = Arc::clone(&worker_context);
        async move {
            let delivery = match delivery {
                Ok(Some(delivery)) => delivery,
                Ok(None) => return,
                Err(error) => {
                    tracing::error!("Failed to consume queue message {}", error);
                    return;
                }
            };
            let worker_ctx = {
                let context = worker_context_mutex.lock().await;
                (*context).clone()
            };
            tracing::info!("Received message");
            match String::from_utf8(delivery.data.clone()) {
                Ok(message) => {
                    let message: MessageWithContext =
                        match serde_json::from_str(&(message)) {
                            Ok(message) => message,
                            Err(error) => {
                                tracing::error!("Failed to deserialize message: {}", error);
                                return;
                            }
                        };
                    tracing::info!("Message Serialised");
                    if let Err(error) = delivery.ack(BasicAckOptions::default()).await {
                        tracing::error!("Failed to ack message: {}", error);
                    }
                    tracing::info!("Message Acked");
                    let res = handler::message_router(worker_ctx, message).await;
                    if let Err(error) = res {
                        tracing::error!("Message handler error: {}", error);
                    }
                }
                Err(error) => {
                    tracing::error!("Failed to convert message to string: {}", error);
                    return;
                }
            }
        }
    });

    // Keep the main function running
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    }
}
