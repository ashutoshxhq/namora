mod actions;
mod db;
mod jsonllm;
mod orchestrator;
mod types;
use std::sync::Arc;

use dotenvy::dotenv;
use lapin::{
    message::DeliveryResult,
    options::{BasicAckOptions, BasicConsumeOptions, BasicPublishOptions, QueueDeclareOptions},
    types::FieldTable,
    BasicProperties, Connection, ConnectionProperties,
};
use namora_core::types::{
    message::{Message, MessageWithContext},
    worker::WorkerContext,
};
use tokio::sync::Mutex;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;
use uuid::Uuid;

use crate::{db::create_pool, orchestrator::TaskOrchestrator};

#[tokio::main]
async fn main() {
    dotenv().ok();
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .with_level(true)
        .with_line_number(true)
        .with_file(true)
        .with_thread_ids(true)
        .json()
        .with_ansi(false)
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
            &format!(
                "namora.svc.task-orchestrator.consumer.{}",
                Uuid::new_v4().to_string()
            ),
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
            tracing::info!("Recieved a message from queue");
            let delivery = match delivery {
                Ok(Some(delivery)) => delivery,
                Ok(None) => {
                    tracing::info!("No message in delivery");
                    return
                },
                Err(error) => {
                    tracing::error!("Failed to consume queue message {}", error);
                    return;
                }
            };
            tracing::info!("Successfully consumed queue message");
            let worker_ctx = {
                let context = worker_context_mutex.lock().await;
                (*context).clone()
            };
            tracing::info!("Worker context created");
            tracing::info!("Trying to parse message");
            match String::from_utf8(delivery.data.clone()) {
                Ok(message) => {
                    tracing::info!("Message parsed");
                    let message_with_context: MessageWithContext =
                        match serde_json::from_str(&(message)) {
                            Ok(message) => message,
                            Err(error) => {
                                tracing::error!("Failed to deserialize message: {}", error);
                                return;
                            }
                        };
                    tracing::info!("Message Serialised ti MessageWithContext");
                    tracing::info!("Trying to ack message");
                    if let Err(error) = delivery.ack(BasicAckOptions::default()).await {
                        tracing::error!("Failed to ack message: {}", error);
                    }
                    tracing::info!("Message Acked");

                    tracing::info!("Trying to orchestrate message");
                    let orchestrator = TaskOrchestrator::new();
                    tracing::info!("Orchestrator created");
                    let response = orchestrator.orchestrate(message_with_context.clone()).await;
                    match response {
                        Ok(response) => {
                            tracing::info!("Message Orchestrated and response recieved");
                            tracing::info!("Trying to publish response");
                            for response_message_with_context in response {
                                tracing::info!("Trying to serialize response message");
                                let message_json =
                                    serde_json::to_vec(&response_message_with_context);
                                if let Err(error) = message_json {
                                    tracing::error!(
                                        "Failed to serialize response message: {}",
                                        error
                                    );
                                    return;
                                }
                                tracing::info!("Response message serialized to json");
                                if response_message_with_context.message.reciever == "system" {
                                    tracing::info!("Publishing message to system");
                                    let task_orchestrator_queue_routing_key = std::env::var(
                                        "TASK_ORCHESTRATION_QUEUE",
                                    )
                                    .expect("Unable to get task orchestrator queue routing key");
                                    tracing::info!(
                                        "Publishing message to {}",
                                        task_orchestrator_queue_routing_key
                                    );
                                    let res = worker_ctx
                                        .channel
                                        .basic_publish(
                                            "",
                                            &task_orchestrator_queue_routing_key,
                                            BasicPublishOptions::default(),
                                            &message_json.unwrap(),
                                            BasicProperties::default(),
                                        )
                                        .await;
                                    if let Err(error) = res {
                                        tracing::error!("Failed to publish message: {}", error);
                                    }
                                    tracing::info!("Published message to system");
                                } else if response_message_with_context.message.reciever == "user" {
                                    tracing::info!("Publishing message to routing_key: {}", &format!(
                                        "namora.user.{}",
                                        response_message_with_context
                                            .context
                                            .user_id
                                    ));
                                    let res = worker_ctx
                                        .channel
                                        .basic_publish(
                                            "",
                                            &format!(
                                                "namora.user.{}",
                                                response_message_with_context
                                                    .context
                                                    .user_id
                                            ),
                                            BasicPublishOptions::default(),
                                            &message_json.unwrap(),
                                            BasicProperties::default(),
                                        )
                                        .await;
                                    if let Err(error) = res {
                                        tracing::error!("Failed to publish message: {}", error);
                                    }
                                    tracing::info!("Published message to user");
                                }
                            }
                        }
                        Err(error) => {
                            tracing::error!("Failed to orchestrate message: {}", error);
                            tracing::info!("Trying to publish error message to user");
                            let context = message_with_context.context.clone();
                            let response_message_with_context = MessageWithContext {
                                message: Message {
                                    message_type: "response".to_string(),
                                    reciever: "user".to_string(),
                                    content: "My apologies, something went wrong. Please try again or refine your query.".to_string(),
                                    additional_info: None,
                                    created_at: chrono::Utc::now().into(),
                                },
                                context,
                            };
                            let res = worker_ctx
                                .channel
                                .basic_publish(
                                    "",
                                    &format!(
                                        "namora.user.{}",
                                        response_message_with_context.context.user_id
                                    ),
                                    BasicPublishOptions::default(),
                                    &serde_json::to_vec(&response_message_with_context).unwrap(),
                                    BasicProperties::default(),
                                )
                                .await;
                            if let Err(error) = res {
                                tracing::error!("Failed to publish message: {}", error);
                            }
                            tracing::info!("Published message to user");
                        }
                    };
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
