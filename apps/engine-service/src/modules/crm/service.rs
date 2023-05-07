use std::env;

use diesel::prelude::*;
use engine_db_repository::{
    models::teams::{Team, UpdateTeam},
    schema::teams::dsl,
};
use hyper::{header};
use namora_core::types::{db::DbPool, error::Error};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Clone)]
pub struct CRMIntegrationService {
    pub pool: DbPool,
}

impl CRMIntegrationService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn link_token(&self, _team_id: Uuid) -> Result<Value, Error> {
        let vessel_api_token = env::var("VESSEL_API_TOKEN")?;

        let client = reqwest::Client::new();
        let res = client
            .post("https://api.vessel.land/link/token")
            .header(
                header::HeaderName::from_static("vessel-api-token"),
                vessel_api_token,
            )
            .send()
            .await?;

        let res_data: Value = res.json().await?;
        let link_token = res_data.get("linkToken");
        if let Some(link_token) = link_token {
            Ok(json!({ "link_token": link_token }))
        } else {
            Err(Error::from("No link token found in vessel response"))
        }
    }

    pub async fn exchange_token(
        &self,
        public_token: String,
        team_id: Uuid,
    ) -> Result<Value, Error> {
        let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
        let client = reqwest::Client::new();
        let res = client
            .post("https://api.vessel.land/link/exchange")
            .header(
                header::HeaderName::from_static("vessel-api-token"),
                vessel_api_token,
            )
            .json(&json!({ "publicToken": public_token }))
            .send()
            .await?;

        let res_data: Value = res.json().await?;
        let access_token = res_data.get("accessToken");
        let connection_id = res_data.get("connectionId");

        if let Some(access_token) = access_token {
            if let Some(connection_id) = connection_id {
                let mut conn = self.pool.clone().get()?;
                let _team: Team = diesel::update(dsl::teams.find(team_id))
                    .set(&UpdateTeam {
                        company_name: None,
                        company_website: None,
                        company_description: None,
                        company_address: None,
                        company_email: None,
                        company_phone: None,
                        metadata: None,
                        no_of_seats: None,
                        plan: None,
                        stripe_customer_id: None,
                        stripe_subscription_id: None,
                        subscription_status: None,
                        vessel_access_token: Some(Some(access_token.to_string())),
                        vessel_connection_id: Some(Some(connection_id.to_string())),
                        trial_started_at: None,
                        created_at: None,
                        deleted_at: None,
                        updated_at: None,
                    })
                    .get_result::<Team>(&mut conn)?;
                Ok(json!({ "message": "Successfully exchanged token" }))
            } else {
                Err(Error::from("No connection id found in vessel response"))
            }
        } else {
            Err(Error::from("No access token found in vessel response"))
        }
    }

    pub async fn get_connection(
        &self,
        connection_id: String,
        _team_id: Uuid,
    ) -> Result<Value, Error> {
        let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
        let client = reqwest::Client::new();
        let res = client
            .get(format!(
                "https://api.vessel.land/connection/connection?connectionId={}",
                connection_id
            ))
            .header(
                header::HeaderName::from_static("vessel-api-token"),
                vessel_api_token,
            )
            .send()
            .await?;
        let res_body: Value = res.json().await?;
        Ok(res_body)
    }

    pub async fn delete_connection(
        &self,
        connection_id: String,
        _team_id: Uuid,
    ) -> Result<Value, Error> {
        let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
        let client = reqwest::Client::new();
        let res = client
            .get("https://api.vessel.land/connection/connection")
            .header(
                header::HeaderName::from_static("vessel-api-token"),
                vessel_api_token,
            )
            .json(&json!({ "connectionId": connection_id }))
            .send()
            .await?;
        let res_body: Value = res.json().await?;
        Ok(res_body)
    }

    pub async fn search_object_records(
        &self,
        object: String,
        filter: Value,
        limit: u32,
        cursor: String,
        all_fields: bool,
        team_id: Uuid,
    ) -> Result<Value, Error> {
        let mut conn = self.pool.clone().get()?;
        let team: Team = dsl::teams.find(team_id).first(&mut conn)?;
        if let Some(access_token) = team.vessel_access_token {
            let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
            let client = reqwest::Client::new();
            let res = client
                .post(format!(
                    "https://api.vessel.land/crm/{}/search?cursor={}&limit={}&allFields={}",
                    object, cursor, limit, all_fields
                ))
                .header(
                    header::HeaderName::from_static("vessel-api-token"),
                    vessel_api_token,
                )
                .json(&json!({ "accessToken": access_token, "filters": filter }))
                .send()
                .await?;
            let res_body: Value = res.json().await?;
            Ok(res_body)
        } else {
            Err(Error::from("No access token found"))
        }
    }

    pub async fn describe_object(&self, object: String, team_id: Uuid) -> Result<Value, Error> {
        let mut conn = self.pool.clone().get()?;
        let team: Team = dsl::teams.find(team_id).first(&mut conn)?;
        if let Some(access_token) = team.vessel_access_token {
            let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
            let client = reqwest::Client::new();
            let res = client
                .get(format!(
                    "https://api.vessel.land/crm/{}/details?accessToken={}&allFields={}",
                    object, access_token, false
                ))
                .header(
                    header::HeaderName::from_static("vessel-api-token"),
                    vessel_api_token,
                )
                .send()
                .await?;
            let res_body: Value = res.json().await?;
            Ok(res_body)
        } else {
            Err(Error::from("No access token found"))
        }
    }

    pub async fn get_object_record(
        &self,
        object: String,
        object_id: String,
        all_fields: bool,
        team_id: Uuid,
    ) -> Result<Value, Error> {
        let mut conn = self.pool.clone().get()?;
        let team: Team = dsl::teams.find(team_id).first(&mut conn)?;

        if let Some(access_token) = team.vessel_access_token {
            let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
            let client = reqwest::Client::new();
            let res = client
                .get(format!(
                    "https://api.vessel.land/crm/{}?id={}&accessToken={}&allFields={}",
                    object, object_id, access_token, all_fields
                ))
                .header(
                    header::HeaderName::from_static("vessel-api-token"),
                    vessel_api_token,
                )
                .send()
                .await?;
            let res_body: Value = res.json().await?;
            Ok(res_body)
        } else {
            Err(Error::from("No access token found"))
        }
    }

    pub async fn create_object_record(
        &self,
        object: String,
        data: Value,
        team_id: Uuid,
    ) -> Result<Value, Error> {
        let mut conn = self.pool.clone().get()?;
        let team: Team = dsl::teams.find(team_id).first(&mut conn)?;
        if let Some(access_token) = team.vessel_access_token {
            let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
            let client = reqwest::Client::new();
            let res = client
                .post(format!("https://api.vessel.land/crm/{}", object))
                .header(
                    header::HeaderName::from_static("vessel-api-token"),
                    vessel_api_token,
                )
                .json(&json!({ "accessToken": access_token, format!("{}", object): data }))
                .send()
                .await?;
            let res_body: Value = res.json().await?;
            Ok(res_body)
        } else {
            Err(Error::from("No access token found"))
        }
    }

    pub async fn update_object_record(
        &self,
        object: String,
        object_id: String,
        data: Value,
        team_id: Uuid,
    ) -> Result<Value, Error> {
        let mut conn = self.pool.clone().get()?;
        let team: Team = dsl::teams.find(team_id).first(&mut conn)?;

        if let Some(access_token) = team.vessel_access_token {
            let vessel_api_token = env::var("VESSEL_API_TOKEN")?;
            let client = reqwest::Client::new();
            let res = client
                .patch(format!("https://api.vessel.land/crm/{}", object))
                .header(
                    header::HeaderName::from_static("vessel-api-token"),
                    vessel_api_token,
                )
                .json(&json!({ "accessToken": access_token, "id": object_id, format!("{}", object): data }))
                .send()
                .await?;
            let res_body: Value = res.json().await?;
            Ok(res_body)
        } else {
            Err(Error::from("No access token found"))
        }
    }
}
