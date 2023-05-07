use serde::{Serialize, Deserialize};
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterWebhookRequest {
    pub idp_user_id: String,
    pub email: String,
    pub username: String,
    pub firstname: Option<String>,
    pub lastname:  Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterWebhookResponse {
    pub user_id: Uuid,
    pub team_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub token_type: String,
    pub access_token: String,
    pub expires_in: u64,
}