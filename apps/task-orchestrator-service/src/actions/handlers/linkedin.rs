use std::fs;

use serde_json::{Value};

use namora_core::types::error::Error;

pub async fn get_linkedin_profile(data: Value) -> Result<Value, Error> {
    let ashutosh = fs::read_to_string("./ashutosh.json")?;
    let profile = serde_json::from_str::<Value>(&ashutosh)?;
    Ok(profile)
}
