use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IsMoreContextRequired {
    pub is_more_context_required: bool,
}
