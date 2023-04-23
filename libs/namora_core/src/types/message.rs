use chrono::NaiveDateTime;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Action {
    pub action_id: String,
    pub action_name: String,
    pub action_description: String,
    pub action_input_format: String,
    pub acion_result: Option<Value>,
}

impl std::ops::Deref for Action {
    type Target = Option<Value>;

    fn deref(&self) -> &Self::Target {
        &self.acion_result
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QueryContext {
    pub query: String,
    pub plan: Option<String>,
    pub unfiltered_actions: Vec<Action>,
    pub filtered_actions: Vec<Action>,
    pub executed_actions: Vec<Action>,
    pub messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConverationContext {
    pub thread_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub team_id: Option<Uuid>,
    pub current_query_context: QueryContext,
    pub past_query_contexts: Vec<QueryContext>,
}


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