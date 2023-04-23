use namora_core::types::error::Error;
use serde_json::{Value, json};

pub async fn get_object_record_from_crm_with_filter(object:String, data: Value) -> Result<Value, Error> {
    Ok(json!({}))
}

pub async fn create_object_record_in_crm(object:String, data: Value) -> Result<Value, Error> {
    Ok(json!({}))
}

pub async fn update_object_record_in_crm_by_id(object:String, data: Value) -> Result<Value, Error> {
    Ok(json!({}))
}
