use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PineconeDocument {
    pub id: String,
    pub score: f32,
    pub values: Option<Vec<f64>>,
    pub metadata: Value
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PineconeQueryResponse {
    pub matches: Vec<PineconeDocument>,
    pub namespace: String
}
