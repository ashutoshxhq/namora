use std::env;

use diesel::prelude::*;
use engine_db_repository::{
    models::{nylas_accounts::{CreateNylasAccount, NylasAccount}, users::User},
    schema::nylas_accounts::dsl,
    schema::users::dsl as users_dsl,
};
use hyper::header::{ACCEPT, CONTENT_TYPE};
use namora_core::types::{db::DbPool, error::Error};
use serde_json::Value;
use tracing::info;
use uuid::Uuid;

use super::types::{
    NylasOAuthCodeExchangeResponse, NylasOAuthTokenRequest, NylasOAuthTokenResponse,
};

#[derive(Clone)]
pub struct NylasIntegrationService {
    pub pool: DbPool,
}

impl NylasIntegrationService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn get_nylas_authorize_url(
        &self,
        user_id: Uuid,
    ) -> Result<NylasOAuthTokenResponse, Error> {
        let nylas_client_id = env::var("NYLAS_CLIENT_ID")?;
        let redirect_uri = "https://engine.svc.api.namora.ai/nylas/oauth/callback".to_string();
        Ok(NylasOAuthTokenResponse{
            redirect_url: format!("https://api.nylas.com/oauth/authorize?client_id={}&redirect_uri={}&response_type=code&scopes=email.read_only,calendar.read_only&state={}",nylas_client_id,redirect_uri, user_id.to_string()),
        })
    }

    pub async fn exchange_code_for_token(
        &self,
        user_id: Uuid,
        code: String,
    ) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        let user: User = users_dsl::users.find(user_id).first(&mut conn)?;

        let nylas_client_id = env::var("NYLAS_CLIENT_ID")?;
        let nylas_client_secret = env::var("NYLAS_CLIENT_SECRET")?;
        let request_data = NylasOAuthTokenRequest {
            client_id: nylas_client_id,
            client_secret: nylas_client_secret.clone(),
            grant_type: "authorization_code".to_string(),
            code,
        };

        let client = reqwest::Client::new();
        let res = client
            .post("https://api.nylas.com/oauth/token")
            .header(ACCEPT, "application/json")
            .header(CONTENT_TYPE, "application/json")
            .basic_auth::<String, String>(nylas_client_secret, None)
            .json(&serde_json::to_value(request_data)?)
            .send()
            .await?;

        let res_data: NylasOAuthCodeExchangeResponse = res.json().await?;

        let _result = diesel::insert_into(dsl::nylas_accounts)
            .values(CreateNylasAccount {
                id: Uuid::new_v4(),
                account_id: res_data.account_id,
                email_address: res_data.email_address,
                access_token: res_data.access_token,
                provider: res_data.provider,
                token_type: res_data.token_type,
                status: "connected".to_string(),
                user_id,
                team_id: user.team_id,
                created_at: Some(chrono::Utc::now().naive_utc()),
                updated_at: Some(chrono::Utc::now().naive_utc()),
                deleted_at: None,
            })
            .get_result::<NylasAccount>(&mut conn)?;

        Ok(())
    }

    pub async fn messages_webhook(
        &self,
        data: Value,
    ) -> Result<(), Error> {
        info!("messages_webhook: {:?}", data);
        Ok(())
    }
}
