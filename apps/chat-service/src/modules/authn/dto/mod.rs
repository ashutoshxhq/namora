use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize, Serialize)]
pub struct RegisterRequestDTO {
    pub firstname: String,
    pub lastname: String,
    pub company_name: String,
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Deserialize, Serialize)]
pub struct LoginRequestDTO {
    pub indentifier: String,
    pub password: String,
}

#[derive(Deserialize, Serialize)]
pub struct RefreshTokenRequestDTO {
    pub refresh_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub aud: String, // Optional. Audience
    pub exp: i64, // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
    pub iat: i64, // Optional. Issued at (as UTC timestamp)
    pub iss: String, // Optional. Issuer
    pub sub: String, // Optional. Subject (whom token refers to)
    pub user_id: Uuid,
    pub team_id: Uuid,
    pub role: String,
}
