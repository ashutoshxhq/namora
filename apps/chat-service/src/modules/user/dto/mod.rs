use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct GetUsersByQuery {
    pub query: String,
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct InviteUser {
    pub firstname: String,
    pub lastname: String,
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: String,
}
