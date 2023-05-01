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
    pub session_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub team_id: Option<Uuid>,
    pub execution_context: ExecutionContext,
    pub messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecutionContext {
    pub user_query: Option<String>,
    pub non_deterministic_plan: Option<Vec<String>>,
    pub deterministic_plan: Option<HashMap<u32, Action>>,
    pub executed_actions: Vec<Action>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Action {
    pub id: String,
    pub name: String,
    pub description: String,
    pub input_format: String,
    pub sample_queries: Option<String>,
    pub additional_info: Option<String>,
    pub acion_result: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub from: String,
    pub to: String,
    pub reply_to: Option<String>,
    pub content: String,
    pub additional_info: AdditionalInfo,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserContext {
    pub user_id: Uuid,
    pub team_id: Uuid,
    pub authorization_token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserMessage {
    pub content: String,
    pub additional_info: Option<Value>,
    pub session_id: Option<Uuid>,
    pub context: UserContext,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AdditionalInfo {
    pub step: String,
    pub data: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NonDeterministicPlanAdditionalInfo {
    pub plan: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExecuteActionInputAdditionalInfo {
    pub action_id: String,
    pub action_input: Value,
}
