use lapin::{options::BasicPublishOptions, BasicProperties, Channel};
use serde_json::Value;
use uuid::Uuid;

use crate::types::error::Error;


pub async fn send_message_to_user(
    channel: Channel,
    user_id: Uuid,
    data: Value,
) -> Result<(), Error> {
    let content = data.to_string().into_bytes();

    channel
        .basic_publish(
            "amq.topic",
            &format!("amq.queue.worker.user.{}", user_id.to_string()),
            BasicPublishOptions::default(),
            &content,
            BasicProperties::default(),
        )
        .await?
        .await?;

    Ok(())
}

pub async fn send_message_to_ai(channel: Channel, data: Value) -> Result<(), Error> {
    let content = data.to_string().into_bytes();
    channel
        .basic_publish(
            "amq.topic",
            "amq.queue.worker.ai",
            BasicPublishOptions::default(),
            &content,
            BasicProperties::default(),
        )
        .await?
        .await?;
    Ok(())
}

pub async fn send_message_to_system(channel: Channel, data: Value) -> Result<(), Error> {
    let content = data.to_string().into_bytes();
    channel
        .basic_publish(
            "amq.topic",
            "amq.queue.worker.system",
            BasicPublishOptions::default(),
            &content,
            BasicProperties::default(),
        )
        .await?
        .await?;
    Ok(())
}
