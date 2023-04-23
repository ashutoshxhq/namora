use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize)]
pub enum ServerMsg {
    Data(Value),
}

#[derive(Debug, Deserialize)]
pub enum ClientMsg {
    Data(Value),
}
