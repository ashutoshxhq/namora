use std::collections::HashMap;

use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct NylasAuthorizeRequest {
    pub user_id: String,
    pub team_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NylasVerifyWebhookRequest {
    pub challenge: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthorizationCodeRequestQuery {
    pub code: String,
    pub state: String,
}

#[derive(Serialize)]
pub struct NylasOAuthTokenRequest {
    pub client_id: String,
    pub client_secret: String,
    pub grant_type: String,
    pub code: String,
}
#[derive(Serialize, Deserialize)]
pub struct NylasOAuthTokenResponse {
    pub redirect_url: String,
}

#[derive(Serialize, Deserialize)]
pub struct NylasOAuthCodeExchangeResponse {
    pub access_token: String,
    pub account_id: String,
    pub email_address: String,
    pub provider: String,
    pub token_type: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct NylasDeltaObject {
    pub date: i64,
    pub object: String,
    pub object_data: NylasObjectData,
    #[serde(rename = "type")]
    pub event_type: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct NylasObjectData {
    pub account_id: String,
    pub attributes: NylasAttributes,
    pub id: String,
    pub metadata: Option<HashMap<String, String>>,
    pub namespace_id: String,
    pub object: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct NylasAttributes {
    pub received_date: i64,
    pub thread_id: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct NylasWebhookMessages {
    pub deltas: Vec<NylasDeltaObject>
}


#[derive(Debug, Serialize, Deserialize)]
pub struct NylasEmail {
    pub account_id: String,
    pub bcc: Vec<HashMap<String, String>>,
    pub body: String,
    pub cc: Vec<HashMap<String, String>>,
    pub date: i64,
    pub events: Vec<String>,
    pub files: Vec<String>,
    #[serde(rename = "from")]
    pub from_field: Vec<NylasFromField>,
    pub id: String,
    pub labels: Vec<NylasLabel>,
    pub object: String,
    pub reply_to: Vec<HashMap<String, String>>,
    pub reply_to_message_id: Option<String>,
    pub snippet: String,
    pub starred: bool,
    pub subject: String,
    pub thread_id: String,
    pub to: Vec<HashMap<String, String>>,
    pub unread: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NylasFromField {
    pub email: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NylasLabel {
    pub display_name: String,
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NylasParticipant {
    pub email: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NylasThread {
    pub account_id: String,
    pub draft_ids: Vec<String>,
    pub first_message_timestamp: u64,
    pub has_attachments: bool,
    pub id: String,
    pub labels: Vec<NylasLabel>,
    pub last_message_received_timestamp: u64,
    pub last_message_sent_timestamp: u64,
    pub last_message_timestamp: u64,
    pub last_updated_timestamp: u64,
    pub messages: Vec<NylasEmail>,
    pub object: String,
    pub participants: Vec<NylasParticipant>,
    pub snippet: String,
    pub starred: bool,
    pub subject: String,
    pub unread: bool,
    pub version: u32,
}