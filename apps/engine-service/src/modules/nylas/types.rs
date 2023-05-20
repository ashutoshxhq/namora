use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct NylasAuthorizeRequest {
    pub user_id: String,
    pub team_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthorizationCodeRequestQuery {
    pub code: String,
    pub state: String,
}

#[derive(Serialize)]
pub struct NylasOAuthTokenRequest {
    pub client_id: String,
    pub client_secret: String,
    pub grant_type: String,
    pub code: String,
}
#[derive(Serialize, Deserialize)]
pub struct NylasOAuthTokenResponse {
    pub redirect_url: String,
}

#[derive(Serialize, Deserialize)]
pub struct NylasOAuthCodeExchangeResponse {
    pub access_token: String,
    pub account_id: String,
    pub email_address: String,
    pub provider: String,
    pub token_type: String,
}