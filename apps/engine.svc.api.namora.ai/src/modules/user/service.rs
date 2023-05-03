use diesel::prelude::*;
use engine_db_repository::{
    models::users::{UpdateUser, User},
    schema::users::dsl,
};
use namora_core::types::{db::DbPool, error::Error};
use serde_json::{json, Value};
use std::collections::HashMap;
use uuid::Uuid;

use super::types::Auth0TokenResponse;

#[derive(Clone)]
pub struct UserService {
    pub pool: DbPool,
}

impl UserService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn get_user(&self, user_id: Uuid) -> Result<User, Error> {
        let mut conn = self.pool.clone().get()?;
        let results: User = dsl::users.find(user_id).first(&mut conn)?;
        Ok(results)
    }

    pub fn get_users(
        &self,
        query: String,
        offset: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<User>, Error> {
        let mut conn = self.pool.clone().get()?;
        let offset = if let Some(offset) = offset { offset } else { 0 };
        let limit = if let Some(limit) = limit { limit } else { 10 };

        let results: Vec<User> = dsl::users
            .filter(
                dsl::username
                    .ilike(format!("%{}%", query.clone()))
                    .or(dsl::email.ilike(format!("%{}%", query.clone())))
                    .or(dsl::firstname.ilike(format!("%{}%", query.clone())))
                    .or(dsl::lastname.ilike(format!("%{}%", query.clone()))),
            )
            .offset(offset)
            .limit(limit)
            .load(&mut conn)?;
        Ok(results)
    }

    pub async fn update_user(&self, user_id: Uuid, data: UpdateUser) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        let user = diesel::update(dsl::users.find(user_id))
            .set(&data)
            .get_result::<User>(&mut conn)?;

        let mut profile_update = false;
        let mut profile_data: HashMap<String, String> = HashMap::new();

        if let Some(Some(firstname)) = data.firstname.clone() {
            profile_update = true;
            profile_data.insert("given_name".to_string(), firstname);
        }

        if let Some(Some(lastname)) = data.lastname.clone() {
            profile_update = true;
            profile_data.insert("family_name".to_string(), lastname);
        }

        if profile_update {
            self.update_user_profile(user.idp_user_id, serde_json::to_value(profile_data)?)
                .await?;
        }

        Ok(())
    }

    pub async fn delete_user(&self, user_id: Uuid) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        let results: User = dsl::users.find(user_id).first(&mut conn)?;

        diesel::delete(dsl::users.find(user_id)).execute(&mut conn)?;

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
                .json::<Auth0TokenResponse>()
                .await?;

        let access_token = token_res.access_token;

        let _res = client
            .delete(format!(
                "https://{}/api/v2/users/{}",
                std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN"),
                results.idp_user_id
            ))
            .header("authorization", format!("Bearer {}", access_token))
            .send()
            .await?
            .json::<HashMap<String, Value>>()
            .await?;

        Ok(())
    }

    pub async fn update_user_profile(&self, idp_user_id: String, data: Value) -> Result<(), Error> {
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
            .json::<Auth0TokenResponse>()
            .await?;
        let access_token = token_res.access_token;

        let _res = client
            .patch(format!(
                "https://{}/api/v2/users/{}",
                std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN"),
                idp_user_id
            ))
            .header("authorization", format!("Bearer {}", access_token))
            .json(&data)
            .send()
            .await?
            .json::<HashMap<String, Value>>()
            .await?;

        Ok(())
    }
}
