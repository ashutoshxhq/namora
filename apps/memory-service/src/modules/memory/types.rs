use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize, Serialize)]
pub struct RetrieveMemoriesRequest {
    pub query: String,
    pub memory_types: String,
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Deserialize, Serialize)]
pub struct RetrieveMemoriesResponse {
    pub memories: Vec<Memory>,
    pub total: i64,
    pub offset: i64,
}

#[derive(Deserialize, Serialize)]
pub struct IndexMemoriesRequest {
    pub memories: Vec<Memory>,
}

#[derive(Deserialize, Serialize)]
pub struct Memory {
    pub memory_type: String,
    pub features: Option<Value>,
    pub data: Value,
    pub user_id: String,
    pub team_id: String,
}