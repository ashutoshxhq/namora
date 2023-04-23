pub type Error = Box<dyn std::error::Error + Send + Sync + 'static>;use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub message_from: String,
    pub message_to: String,
    pub next_message_to: Option<String>,
    pub message: String,
    pub additional_data: Option<Value>,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionContext {
    pub action_id: String,
    pub action_name: String,
    pub action_description: String,
    pub action_input_format: String,
    pub acion_result: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConverationHistory {
    pub messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConverationContext {
    pub thread_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub team_id: Option<Uuid>,
    pub history: ConverationHistory,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MessageWithConversationContext {
    pub messages: Vec<Message>,
    pub ai_system_prompt: Option<String>,
    pub context: ConverationContext,
}
