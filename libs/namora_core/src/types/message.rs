use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MessageWithContext {
    pub message: Message,
    pub context: Context,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Context {
    pub session_id: Uuid,
    pub user_id: Uuid,
    pub team_id: Uuid,
    pub authorization_token: String,
    pub execution_context: ExecutionContext,
    pub messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecutionContext {
    pub user_query: Option<String>,
    pub non_deterministic_plan: Option<String>,
    pub deterministic_plan: Option<HashMap<u32, Action>>,
    pub executed_actions: Vec<Action>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Action {
    pub id: String,
    pub name: String,
    pub description: String,
    pub input_json_schema: Value,
    pub sample_queries: Vec<String>,
    pub additional_info: Option<String>,
    pub acion_result: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub reciever: String,
    pub message_type: String,
    pub content: String,
    pub additional_info: Option<Value>,
    pub created_at: Option<DateTime<Utc>>,
}