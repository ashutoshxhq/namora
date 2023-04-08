use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct GetTeamsByQuery {
    pub query: String,
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}