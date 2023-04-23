use chrono::NaiveDateTime;
use serde::{Serialize, Deserialize};
use serde_json::Value;

use super::context::ConverationContext;


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
pub struct AdditionalData {
    pub action: String,
    pub action_data: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FindActionsAdditionalData {
    pub plan: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecuteActionPlanAdditionalData {
    pub action_ids: Vec<String>,
    pub first_action_input: Value
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecuteActionAdditionalData {
    pub action_id: String,
    pub action_input: Value
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MessageWithConversationContext {
    pub messages: Vec<Message>,
    pub ai_system_prompt: Option<String>,
    pub context: ConverationContext,
}