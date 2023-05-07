use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExchangeTokenRequest {
    pub public_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchObjectRecordsRequest {
    pub filter: Option<String>,
    pub limit: Option<u32>,
    pub cursor: Option<String>,
    pub all_fields: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LinkTokenResponse {
    pub link_token: String,
}