use namora_core::types::{error::Error, message::Context};
use serde_json::{json, Value};

use super::handlers::{
    crm::{
        create_object_record_in_crm, get_object_records_from_crm_with_filter,
        update_object_record_in_crm_by_id,
    },
    linkedin::get_linkedin_profile,
};

pub async fn route(
    context: Context,
    action_id: String,
    action_data: Value,
) -> Result<Value, Error> {
    let res = match action_id.as_str() {
        "get_linkedin_person_profile" => get_linkedin_profile(context, action_data).await?,
        "get_lead_from_crm_with_filter" => {
            get_object_records_from_crm_with_filter(context, "lead".to_string(), action_data).await?
        }
        "create_lead_in_crm" => {
            create_object_record_in_crm(context, "lead".to_string(), action_data).await?
        }
        "update_lead_in_crm_by_id" => {
            update_object_record_in_crm_by_id(context, "lead".to_string(), action_data).await?
        }
        "get_account_from_crm_with_filter" => {
            get_object_records_from_crm_with_filter(context, "account".to_string(), action_data).await?
        }
        "create_account_in_crm" => {
            create_object_record_in_crm(context, "account".to_string(), action_data).await?
        }
        "update_account_in_crm_by_id" => {
            update_object_record_in_crm_by_id(context, "account".to_string(), action_data).await?
        }
        "get_deal_from_crm_with_filter" => {
            get_object_records_from_crm_with_filter(context, "deal".to_string(), action_data).await?
        }
        "create_deal_in_crm" => {
            create_object_record_in_crm(context, "deal".to_string(), action_data).await?
        }
        "update_deal_in_crm_by_id" => {
            update_object_record_in_crm_by_id(context, "deal".to_string(), action_data).await?
        }
        "get_contact_from_crm_with_filter" => {
            get_object_records_from_crm_with_filter(context, "contact".to_string(), action_data).await?
        }
        "create_contact_in_crm" => {
            create_object_record_in_crm(context, "contact".to_string(), action_data).await?
        }
        "update_contact_in_crm_by_id" => {
            update_object_record_in_crm_by_id(context, "contact".to_string(), action_data).await?
        }
        _ => {
            json!({})
        }
    };
    Ok(res)
}
