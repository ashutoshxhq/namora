use serde_json::{Value, json};

use crate::types::error::Error;

pub async fn get_linkedin_profile(data: Value) -> Result<Value, Error> {
    Ok(json!({}))

}
