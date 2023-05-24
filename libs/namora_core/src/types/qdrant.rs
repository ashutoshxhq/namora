use std::collections::HashMap;

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Document {
    pub id: String,
    pub data: String,
    pub metadata: HashMap<String, String>,
}
