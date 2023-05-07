use std::env;

use reqwest::header;
use serde_json::Value;

use namora_core::types::{error::Error, message::Context};

pub async fn get_linkedin_profile(_context: Context, data: Value) -> Result<Value, Error> {
    let proxycurl_api_token = env::var("PROXYCURL_API_TOKEN")?;
    let linkedin_profile_url = data.get("profile_url");
    if linkedin_profile_url.is_none() {
        return Err(Error::from("linkedin person profile_url is required"));
    }
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "https://nubela.co/proxycurl/api/v2/linkedin?url={}&use_cache=if-recent",
            linkedin_profile_url.unwrap()
        ))
        .header(
            header::HeaderName::from_static("Authorization"),
            format!("Bearer {}", proxycurl_api_token),
        )
        .send()
        .await?;

    let res_data: Value = res.json().await?;
    Ok(res_data)
}
