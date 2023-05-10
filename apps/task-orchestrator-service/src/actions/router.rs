use namora_core::types::{error::Error, message::Context};
use serde_json::Value;

use super::handlers::{
    crm::get_object_records_from_crm_with_filter, linkedin::get_linkedin_profile,
};

pub async fn route(
    context: Context,
    action_id: String,
    action_data: Value,
) -> Result<Value, Error> {
    let res = match action_id.as_str() {
        "get_linkedin_person_profile" => get_linkedin_profile(context, action_data).await?,
        "search_company" => {
            get_object_records_from_crm_with_filter(context, "accounts".to_string(), action_data)
                .await?
        }
        "search_deal" => {
            get_object_records_from_crm_with_filter(context, "deals".to_string(), action_data)
                .await?
        }
        "search_contact" => {
            get_object_records_from_crm_with_filter(context, "contacts".to_string(), action_data)
                .await?
        }
        _ => {
            return Err(Error::from(format!(
                "Action with id {} not found",
                action_id
            )))?;
        }
    };
    Ok(res)
}
