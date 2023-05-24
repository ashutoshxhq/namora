use std::{env, fs};

use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use diesel::prelude::*;
use engine_db_repository::{
    models::{
        nylas_accounts::{CreateNylasAccount, NylasAccount},
        users::User,
    },
    schema::nylas_accounts::dsl,
    schema::users::dsl as users_dsl,
};
use handlebars::Handlebars;
use hyper::header::{ACCEPT, CONTENT_TYPE};
use namora_core::types::{db::DbPool, error::Error};
use serde_json::{json, Value};
use tracing::info;
use uuid::Uuid;

use crate::modules::nylas::types::{NylasEmail, NylasThread};

use super::types::{
    NylasOAuthCodeExchangeResponse, NylasOAuthTokenRequest, NylasOAuthTokenResponse,
    NylasWebhookMessages, NylasConnectionStatusResponse,
};

#[derive(Clone)]
pub struct NylasIntegrationService {
    pub pool: DbPool,
}

impl NylasIntegrationService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn get_integration_status(
        &self,
        team_id: Uuid,
    ) -> Result<NylasConnectionStatusResponse, Error> {
        let mut conn = self.pool.clone().get()?;
        let nylas_account: NylasAccount = dsl::nylas_accounts
            .filter(dsl::team_id.eq(team_id))
            .first(&mut conn)?;

        Ok(NylasConnectionStatusResponse {
            connection_status: nylas_account.status,
        })
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

    pub async fn exchange_code_for_token(&self, user_id: Uuid, code: String) -> Result<(), Error> {
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

    pub async fn messages_webhook(&self, data: NylasWebhookMessages) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        info!("messages_webhook: {:?}", data);

        for delta in &data.deltas {
            let users: Vec<NylasAccount> = dsl::nylas_accounts
                .filter(dsl::account_id.eq(delta.object_data.account_id.clone()))
                .limit(1)
                .load(&mut conn)?;
            let user = users.first().unwrap().clone();
            info!("Recieved message for user: {:?}", user.email_address);

            let client = reqwest::Client::new();
            let res = client
                .get(format!(
                    "https://api.nylas.com/messages/{}",
                    delta.object_data.id
                ))
                .header(ACCEPT, "application/json")
                .header(CONTENT_TYPE, "application/json")
                .bearer_auth(user.access_token.clone())
                .send()
                .await?;

            let message_res: NylasEmail = res.json().await?;
            if delta.event_type == "message.created" {
                info!("Recieved message: {:?}", message_res);
                let is_sent_email = message_res
                    .from_field
                    .iter()
                    .any(|from| from.email == user.email_address);
                if is_sent_email {
                    info!("Webhook Message is sent email");
                    // push the email to qdrant
                } else {
                    info!("Webhook Message is received email");
                    let res = client
                        .get(format!(
                            "https://api.nylas.com/threads/{}?view=expanded",
                            message_res.thread_id
                        ))
                        .header(ACCEPT, "application/json")
                        .header(CONTENT_TYPE, "application/json")
                        .bearer_auth(user.access_token.clone())
                        .send()
                        .await?;

                    let res_data: NylasThread = res.json().await?;

                    let is_one_of_senders = res_data.messages.iter().any(|message| {
                        message
                            .from_field
                            .iter()
                            .any(|from| from.email == user.email_address)
                    });

                    if is_one_of_senders {
                        info!("user has send a message in this thread, so handling it");
                        tracing::info!("Creating a reply for the message");
                        let prompt = fs::read_to_string("./public/prompts/reply-generator.txt")?;
                        let reg = Handlebars::new();
                        let prompt_with_data = reg.render_template(
                            &prompt,
                            &json!({
                                "thread": message_res.body
                            }),
                        )?;

                        let openai_client: Client =
                            Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
                        let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();

                        messages.push(
                            ChatCompletionRequestMessageArgs::default()
                                .role(Role::User)
                                .content(prompt_with_data.clone())
                                .build()?,
                        );
                        let request = CreateChatCompletionRequestArgs::default()
                            .model("gpt-4")
                            .messages(messages)
                            .build()?;
                        tracing::info!("Sending request to openai");
                        let response = openai_client.chat().create(request).await;
                        match response {
                            Ok(response) => {
                                tracing::info!("Got response from openai");
                                tracing::info!("Response: {:?}", response);
                                let reply_message = response.choices[0].message.content.clone();
                                let draft = json!({
                                  "to": message_res.from_field,
                                  "reply_to_message_id": message_res.id,
                                  "body": reply_message
                                });
                                tracing::info!("Creating a draft for the reply");
                                let res = client
                                    .post(format!("https://api.nylas.com/drafts",))
                                    .header(ACCEPT, "application/json")
                                    .header(CONTENT_TYPE, "application/json")
                                    .bearer_auth(user.access_token)
                                    .json(&draft)
                                    .send()
                                    .await?;
                                let _res_data: Value = res.json().await?;
                                tracing::info!(
                                    "Created a reply for the message and added it in draft"
                                );
                                // push to qdrant
                            }
                            Err(err) => {
                                tracing::error!("Error from openai: {:?}", err);
                                return Err(err.into());
                            }
                        }
                    } else {
                        //TODO: check if sender is in contacts/leads in crm
                        //TODO: use ai to figure out if it should be handled
                        info!("user has not send a message in this thread, so ignoring it");
                    }
                }
            }
        }
        Ok(())
    }
}
