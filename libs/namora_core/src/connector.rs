use amqprs::{
    channel::{BasicPublishArguments, Channel},
    BasicProperties,
};
use serde_json::Value;
use uuid::Uuid;

use crate::types::{error::Error, worker::WorkerContext};

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

pub async fn send_message_to_ai(channel: Channel, data: Value) -> Result<(), Error> {
    let content = data.to_string().into_bytes();

    let args = BasicPublishArguments::new("amq.topic", "amqprs.worker.ai");
    channel
        .basic_publish(BasicProperties::default(), content, args)
        .await?;

    Ok(())
}

pub async fn send_message_to_system(channel: Channel, data: Value) -> Result<(), Error> {
    let content = data.to_string().into_bytes();

    let args = BasicPublishArguments::new("amq.topic", "amqprs.worker.system");

    channel
        .basic_publish(BasicProperties::default(), content, args)
        .await?;

    Ok(())
}
