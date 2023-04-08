use async_openai::types::Role;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub enum ServerMsg {
    Data(Value),
}

#[derive(Debug, Deserialize)]
pub enum ClientMsg {
    Data(Value),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Response {
    pub response_from: String,
    pub response_to: String,
    pub action: Option<String>,
    pub response: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Query {
    pub query_from: String,
    pub query_to: String,
    pub response_to: Option<String>,
    pub query: Option<String>,
    pub data: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Msg {
    Query(Query),
    Response(Response),
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
    pub messages: Vec<Msg>,
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
    pub message: Msg,
    pub openai_system_prompt: Option<String>,
    pub context: ConverationContext,
}
