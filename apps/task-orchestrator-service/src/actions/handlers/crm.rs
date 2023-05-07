use namora_core::types::{error::Error, message::Context};
use reqwest::header;
use serde_json::Value;
use base64::{Engine as _, engine::general_purpose};

pub async fn get_object_records_from_crm_with_filter(
    context: Context,
    object: String,
    data: Value,
) -> Result<Value, Error> {
    let client = reqwest::Client::new();
    if let Some(authorization_token) = context.authorization_token {
        if context.team_id.is_none() {
            return Err(Error::from("No team id found in context"));
        }
        if let Some(filters) = data.get("filters") {
            let filter_str = filters.to_string();
            let filter_bytes = filter_str.as_bytes();
            let encoded_filter: String = general_purpose::STANDARD_NO_PAD.encode(filter_bytes);
            let res = client
                .get(format!(
                    "https://engine.svc.api.namora.ai/teams/{}/integrations/crm/objects/{}/search?filter={}",
                    context.team_id.unwrap(),
                    object, 
                    encoded_filter
                ))
                .header(
                    header::HeaderName::from_static("Authorization"),
                    format!("Bearer {}", authorization_token),
                )
                .send()
                .await?;
    
            let res_data: Value = res.json().await?;
            Ok(res_data)
        } else{
            return Err(Error::from("No filters found in data"));
        }
    } else {
        return Err(Error::from("No authorization token found in context"));
    }
}

pub async fn create_object_record_in_crm(
    context: Context,
    object: String,
    data: Value,
) -> Result<Value, Error> {
    let client = reqwest::Client::new();
    if let Some(authorization_token) = context.authorization_token {
        if context.team_id.is_none() {
            return Err(Error::from("No team id found in context"));
        }
        if let Some(data) = data.get(object.as_str()) {
        let res = client
            .post(format!(
                "https://engine.svc.api.namora.ai/teams/{}/integrations/crm/objects/{}",
                context.team_id.unwrap(),
                object
            ))
            .header(
                header::HeaderName::from_static("Authorization"),
                format!("Bearer {}", authorization_token),
            )
            .json(&data)
            .send()
            .await?;

        let res_data: Value = res.json().await?;
        Ok(res_data)
    } else{
        return Err(Error::from("No updated data found"));
    }
    } else {
        return Err(Error::from("No authorization token found in context"));
    }
}

pub async fn update_object_record_in_crm_by_id(
    context: Context,
    object: String,
    data: Value,
) -> Result<Value, Error> {
    let client = reqwest::Client::new();
    if let Some(authorization_token) = context.authorization_token {
        if context.team_id.is_none() {
            return Err(Error::from("No team id found in context"));
        }
        if let Some(id) = data.get("id") {
            if let Some(data) = data.get(object.as_str()) {
                let res = client
                .patch(format!(
                    "https://engine.svc.api.namora.ai/teams/{}/integrations/crm/objects/{}/{}",
                    context.team_id.unwrap(),
                    object,
                    id
                ))
                .header(
                    header::HeaderName::from_static("Authorization"),
                    format!("Bearer {}", authorization_token),
                )
                .json(&data)
                .send()
                .await?;
    
            let res_data: Value = res.json().await?;
            Ok(res_data)
            } else{
                return Err(Error::from("No updated data found"));
            }
            
        } else{
            return Err(Error::from("No id found in data"));
        }
    } else {
        return Err(Error::from("No authorization token found in context"));
    }
}
