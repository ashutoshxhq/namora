use serde_json::{Value, json};

use namora_core::types::error::Error;

pub async fn get_linkedin_profile(data: Value) -> Result<Value, Error> {
    Ok(json!({}))

}
