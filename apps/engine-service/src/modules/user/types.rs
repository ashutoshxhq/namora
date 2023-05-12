use serde::{Deserialize, Serialize};


#[derive(Deserialize)]
pub struct GetUsersByQuery {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Auth0TokenResponse {
    pub token_type: String,
    pub access_token: String,
    pub expires_in: u64,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateUserRequest {
    pub firstname: String,
    pub lastname: String,
    pub email: String,
    pub role: String,
}