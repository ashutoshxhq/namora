use amqprs::channel::Channel;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use uuid::Uuid;

use crate::db::DbPool;

use super::message::Message;


#[derive(Clone)]
pub struct WorkerContext {
    pub pool: DbPool,
    pub channel: Channel
}

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
