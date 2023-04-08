use crate::schema::users;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, AsChangeset, Serialize, Deserialize, Insertable)]
#[diesel(table_name = users)]
pub struct UpdateUser {
    pub firstname: Option<String>,
    pub lastname: Option<String>,
    pub email: Option<String>,
    pub username: Option<String>,
    pub role: Option<String>,
    pub profile_pic: Option<String>,
    pub about: Option<String>,
    pub timezone: Option<String>,
    pub metadata: Option<Value>,
    pub updated_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Debug, Insertable, Serialize, Deserialize)]
#[diesel(table_name = users)]
pub struct CreateUser {
    pub firstname: String,
    pub lastname: String,
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: String,
    pub team_id: Uuid,
}

#[derive(Debug, Queryable, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub firstname: String,
    pub lastname: String,
    pub email: String,
    pub password: String,
    pub username: String,
    pub role: String,
    pub profile_pic: Option<String>,
    pub about: Option<String>,
    pub timezone: Option<String>,
    pub metadata: Option<Value>,
    pub team_id: Uuid,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>,
}
