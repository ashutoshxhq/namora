use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize, Serialize)]
pub struct RetrieveMemoriesRequest {
    pub query: String,
    pub namespaces: Vec<String>,
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Deserialize, Serialize)]
pub struct RetrieveMemoriesResponse {
    pub documents: Vec<Document>,
    pub total: i64,
    pub offset: i64,
}

#[derive(Deserialize, Serialize)]
pub struct IndexMemoriesRequest {
    pub documents: Vec<Document>,
}

#[derive(Deserialize, Serialize)]
pub struct Document {
    pub title: String,
    pub body: String,
    pub metadata: Value,
    pub namespace: String,
}
