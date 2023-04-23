use crate::types::error::Error;
use serde_json::{Value, json};

use super::{linkedin::get_linkedin_profile, crm::{get_object_record_from_crm_with_filter, create_object_record_in_crm, update_object_record_in_crm_by_id}};

pub async fn route(action_id: String, action_data: Value) -> Result<Value, Error> {
    let res = match action_id.as_str() {
        "get_linkedin_profile" => {
            get_linkedin_profile(action_data).await?
        }
        "get_lead_from_crm_with_filter" => {
            get_object_record_from_crm_with_filter(
                "lead".to_string(),
                action_data,
            )
            .await?
        }
        "create_lead_in_crm" => {
            create_object_record_in_crm(
                "lead".to_string(),
                action_data,
            )
            .await?
        }
        "update_lead_in_crm_by_id" => {
            update_object_record_in_crm_by_id(
                "lead".to_string(),
                action_data,
            )
            .await?
        }
        "get_account_from_crm_with_filter" => {
            get_object_record_from_crm_with_filter(
                "account".to_string(),
                action_data,
            )
            .await?
        }
        "create_account_in_crm" => {
            create_object_record_in_crm(
                "account".to_string(),
                action_data,
            )
            .await?
        }
        "update_account_in_crm_by_id" => {
            update_object_record_in_crm_by_id(
                "account".to_string(),
                action_data,
            )
            .await?
        }
        "get_deal_from_crm_with_filter" => {
            get_object_record_from_crm_with_filter(
                "deal".to_string(),
                action_data,
            )
            .await?
        }
        "create_deal_in_crm" => {
            create_object_record_in_crm(
                "deal".to_string(),
                action_data,
            )
            .await?
        }
        "update_deal_in_crm_by_id" => {
            update_object_record_in_crm_by_id(
                "deal".to_string(),
                action_data,
            )
            .await?
        }
        "get_contact_from_crm_with_filter" => {
            get_object_record_from_crm_with_filter(
                "contact".to_string(),
                action_data,
            )
            .await?
        }
        "create_contact_in_crm" => {
            create_object_record_in_crm(
                "contact".to_string(),
                action_data,
            )
            .await?
        }
        "update_contact_in_crm_by_id" => {
            update_object_record_in_crm_by_id(
                "contact".to_string(),
                action_data,
            )
            .await?
        }
        _ => {
            json!({})
        }
    };
    Ok(res)
}