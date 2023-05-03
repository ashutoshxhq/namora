use crate::modules::authn::types::TokenResponse;
use diesel::prelude::*;
use engine_db_repository::{
    models::{
        teams::{CreateTeam, Team},
        users::{CreateUser, UpdateUser, User},
    },
    schema::{
        teams,
        users::{self, dsl as users_dsl},
    },
};
use namora_core::types::{db::DbPool, error::Error};
use serde_json::{json, Value};
use std::collections::HashMap;
use uuid::Uuid;

use super::types::{RegisterWebhookRequest, RegisterWebhookResponse};

#[derive(Clone)]
pub struct AuthNService {
    pub pool: DbPool,
}

impl AuthNService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn register_webhook(
        &self,
        data: RegisterWebhookRequest,
    ) -> Result<RegisterWebhookResponse, Error> {
        let mut conn = self.pool.clone().get()?;
        tracing::info!("Registering webhook for user: {}", data.email);
        let existing_user: Option<User> = users_dsl::users
            .filter(users_dsl::email.eq(data.email.clone()))
            .first::<User>(&mut conn)
            .optional()?;

        if let Some(user) = existing_user {
            tracing::info!("User already exists, ignoring this operation");
            return Ok(RegisterWebhookResponse {
                user_id: user.id,
                team_id: user.team_id,
            });
        }
        // Split the email to extract the domain and query database to find a single user with the same domain
        let email_parts: Vec<&str> = data.email.split('@').collect();
        let domain = email_parts[1];
        // use a like serach to find a user with the same domain as the email
        let existing_user: Option<User> = users_dsl::users
            .filter(users_dsl::email.ilike(format!("%@{}%", domain)))
            .first::<User>(&mut conn)
            .optional()?;

        if let Some(user) = existing_user {
            tracing::info!(
                "Found a user with the same domain, connecting the user to the same team"
            );
            let created_user: User = diesel::insert_into(users::table)
                .values(&CreateUser {
                    id: Uuid::new_v4(),
                    team_id: user.team_id,
                    email: Some(data.email.clone()),
                    username: Some(data.username.clone()),
                    firstname: data.firstname.clone(),
                    lastname: data.lastname.clone(),
                    company_position: None,
                    connection: None,
                    credits: None,
                    idp_user_id: data.idp_user_id.clone(),
                    position_description: None,
                    profile_pic: None,
                    readme: None,
                    role: "MEMBER".to_string(),
                    timezone: None,
                    metadata: None,
                    created_at: None,
                    updated_at: None,
                    deleted_at: None,
                })
                .get_result(&mut conn)?;

            let res = self
                .update_user_auth0(
                    data.idp_user_id.clone(),
                    created_user.id.clone(),
                    user.team_id.clone(),
                )
                .await?;

            let email = res.get("email");
            let username = res.get("username");
            if let Some(email) = email {
                if let Some(username) = username {
                    let _user = diesel::update(users_dsl::users.find(created_user.id))
                        .set(&UpdateUser {
                            email: serde_json::from_value(email.clone())?,
                            username: serde_json::from_value(username.clone())?,
                            team_id: None,
                            firstname: None,
                            lastname: None,
                            company_position: None,
                            connection: None,
                            credits: None,
                            idp_user_id: None,
                            position_description: None,
                            profile_pic: None,
                            readme: None,
                            role: None,
                            timezone: None,
                            metadata: None,
                            created_at: None,
                            updated_at: None,
                            deleted_at: None,
                        })
                        .get_result::<User>(&mut conn)?;
                }
            }

            return Ok(RegisterWebhookResponse {
                user_id: created_user.id,
                team_id: user.team_id,
            });
        }

        tracing::info!("Creating a new team");
        let created_team: Team = diesel::insert_into(teams::table)
            .values(&CreateTeam {
                id: Uuid::new_v4(),
                company_name: None,
                company_website: None,
                company_description: None,
                company_address: None,
                company_email: None,
                company_phone: None,
                metadata: None,
                no_of_seats: Some(1),
                plan: None,
                stripe_customer_id: None,
                stripe_subscription_id: None,
                subscription_status: None,
                vessel_access_token: None,
                vessel_connection_id: None,
                trial_started_at: None,
                created_at: None,
                deleted_at: None,
                updated_at: None,
            })
            .get_result(&mut conn)?;
        tracing::info!("Created a new team: {}", created_team.id);

        tracing::info!("Creating a new user");
        let created_user: User = diesel::insert_into(users::table)
            .values(&CreateUser {
                id: Uuid::new_v4(),
                team_id: created_team.id,
                email: Some(data.email.clone()),
                username: Some(data.username.clone()),
                firstname: data.firstname.clone(),
                lastname: data.lastname.clone(),
                company_position: None,
                connection: None,
                credits: None,
                idp_user_id: data.idp_user_id.clone(),
                position_description: None,
                profile_pic: None,
                readme: None,
                role: "OWNER".to_string(),
                timezone: None,
                metadata: None,
                created_at: None,
                updated_at: None,
                deleted_at: None,
            })
            .get_result(&mut conn)?;
        tracing::info!("Created a new user: {}", created_user.id);

        let res = self
            .update_user_auth0(
                data.idp_user_id.clone(),
                created_user.id.clone(),
                created_team.id.clone(),
            )
            .await?;

        let email = res.get("email");
        let username = res.get("username");
        if let Some(email) = email {
            if let Some(username) = username {
                let _user = diesel::update(users_dsl::users.find(created_user.id))
                    .set(&UpdateUser {
                        email: serde_json::from_value(email.clone())?,
                        username: serde_json::from_value(username.clone())?,
                        team_id: None,
                        firstname: None,
                        lastname: None,
                        company_position: None,
                        connection: None,
                        credits: None,
                        idp_user_id: None,
                        position_description: None,
                        profile_pic: None,
                        readme: None,
                        role: None,
                        timezone: None,
                        metadata: None,
                        created_at: None,
                        updated_at: None,
                        deleted_at: None,
                    })
                    .get_result::<User>(&mut conn)?;
            }
        }
        Ok(RegisterWebhookResponse {
            user_id: created_user.id,
            team_id: created_team.id,
        })
    }

    pub async fn update_user_auth0(
        &self,
        idp_user_id: String,
        user_id: Uuid,
        team_id: Uuid,
    ) -> Result<HashMap<String, Value>, Error> {
        tracing::info!("Getting token");
        let client = reqwest::Client::new();
        let audience = format!(
            "https://{}/api/v2/",
            std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN")
        );
        let token_res = client
            .post(format!(
                "https://{}/oauth/token",
                std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN")
            ))
            .json(&json!({
                "grant_type": "client_credentials",
                "client_id": std::env::var("AUTH0_CLIENT_ID").expect("Unable to get AUTH0_CLIENT_ID"),
                "client_secret": std::env::var("AUHT0_CLIENT_SECRET").expect("Unable to get AUHT0_CLIENT_SECRET"),
                "audience": audience
            }))
            .send()
            .await?
            .json::<TokenResponse>()
            .await?;
        let access_token = token_res.access_token;

        tracing::info!("Updating user metadata in auth0");
        let res = client
            .patch(format!(
                "https://{}/api/v2/users/{}",
                std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN"),
                idp_user_id
            ))
            .json(&json!({
              "user_metadata": {
                "user_id": user_id,
                "team_id": team_id,
              }
            }))
            .header("authorization", format!("Bearer {}", access_token))
            .send()
            .await?
            .json::<HashMap<String, Value>>()
            .await?;
        Ok(res)
    }
}
