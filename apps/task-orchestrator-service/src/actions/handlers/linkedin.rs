use serde_json::Value;
use std::{collections::HashMap, env};

use namora_core::types::{error::Error, message::Context};

use crate::types::linkedin::Person;

pub async fn get_linkedin_profile(_context: Context, data: Value) -> Result<Value, Error> {
    let proxycurl_api_token = env::var("PROXYCURL_API_TOKEN")?;
    let data: HashMap<String, String> = serde_json::from_value(data)?;
    let linkedin_profile_url = data.get("linkedin_profile_url");
    if linkedin_profile_url.is_none() {
        return Err(Error::from("linkedin_profile_url is required"));
    }
    tracing::info!(
        "Calling https://nubela.co/proxycurl/api/v2/linkedin?url={}&use_cache=if-recent",
        linkedin_profile_url.unwrap()
    );
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "https://nubela.co/proxycurl/api/v2/linkedin?url={}&use_cache=if-recent",
            linkedin_profile_url.unwrap()
        ))
        .header("Authorization", format!("Bearer {}", proxycurl_api_token))
        .send()
        .await?;

    let res_data: Value = res.json().await?;
    match serde_json::from_value::<Person>(res_data.clone()) {
        Ok(profile) => {
            let res_data = serde_json::to_value(profile)?;
            Ok(res_data)
        }
        Err(_err) => {
            return Err(Error::from(format!(
                "Unable to parse proxycurl response: {}",
                res_data
            )))
        }
    }
}
