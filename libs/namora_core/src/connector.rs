use amqprs::{channel::BasicPublishArguments, BasicProperties};
use serde_json::Value;
use uuid::Uuid;

use crate::types::{worker::WorkerContext, error::Error};


pub async fn send_message_to_user(
    worker_context: WorkerContext,
    user_id: Uuid,
    data: Value,
) -> Result<(), Error> {
    let content = data.to_string().into_bytes();

    let args = BasicPublishArguments::new(
        "amq.topic",
        &format!("amqprs.worker.user.{}", user_id.to_string()),
    );
    worker_context
        .channel
        .basic_publish(BasicProperties::default(), content, args)
        .await?;
    Ok(())
}

pub async fn send_message_to_ai(worker_context: WorkerContext, data: Value) -> Result<(), Error> {
    let content = data.to_string().into_bytes();

    let args = BasicPublishArguments::new("amq.topic", "amqprs.worker.ai");
    worker_context
        .channel
        .basic_publish(BasicProperties::default(), content, args)
        .await?;

    Ok(())
}


pub async fn send_message_to_system(worker_context: WorkerContext, data: Value) -> Result<(), Error> {
    let content = data.to_string().into_bytes();

    let args = BasicPublishArguments::new("amq.topic", "amqprs.worker.system");
    worker_context
        .channel
        .basic_publish(BasicProperties::default(), content, args)
        .await?;

    Ok(())
}
