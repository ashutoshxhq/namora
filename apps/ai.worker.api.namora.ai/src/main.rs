mod handler;
use dotenvy::dotenv;
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
    ConnectionProperties, Connection,
};
use namora_core::{
    db::create_pool,
    types::{error::Error, message::MessageWithConversationContext, worker::WorkerContext},
};
use std::sync::Arc;
use tokio::sync::Mutex;
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

    if let Err(err) = worker().await {
        tracing::error!("Error: {:?}", err);
    }
}

async fn worker() -> Result<(), Error> {
    let pool = create_pool()?;
    let uri = std::env::var("RABBITMQ_URI")?;
    let options = ConnectionProperties::default()
        .with_executor(tokio_executor_trait::Tokio::current())
        .with_reactor(tokio_reactor_trait::Tokio);

    let connection = Connection::connect(&uri, options).await?;
    let channel = connection.create_channel().await?;

    let _queue = channel
        .queue_declare(
            "amq.queue.worker.ai",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;

    let consumer = channel
        .basic_consume(
            "amq.queue.worker.ai",
            "ai_worker",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

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
                    tracing::error!("Failed to consume queue message {}", error);
                    return;
                }
            };

            let worker_ctx = {
                let worker_ctx_guard = worker_context_mutex.lock().await;
                (*worker_ctx_guard).clone()
            };
            match String::from_utf8(delivery.data.clone()) {
                Ok(message) => {
                    tracing::debug!("Received message: {:?}", message);
                    let message: MessageWithConversationContext = match serde_json::from_str(&message) {
                        Ok(message) => message,
                        Err(err) => {
                            tracing::error!("Failed to deserialize message: {:?}", err);
                            return;
                        }
                    };
        
                    if let Err(err) = handler::message_handler(worker_ctx, message).await {
                        tracing::error!("Failed to handle message: {:?}", err);
                    }
        
                    if let Err(err) = delivery.ack(BasicAckOptions::default()).await {
                        tracing::error!("Failed to ack message: {:?}", err);
                    }
                }
                Err(err) => {
                    tracing::error!("Failed to convert message to string: {:?}", err);
                    return;
                }
            }
            
        }
    });
    Ok(())
}