use crate::schema::teams;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, AsChangeset, Serialize, Deserialize, Insertable)]
#[diesel(table_name = teams)]
pub struct UpdateTeam {
    pub name: Option<String>,
    pub website: Option<String>,
    pub about: Option<String>,
    pub no_of_seats: Option<i32>,
    pub metadata: Option<Value>,
    pub updated_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Debug, Insertable, Serialize, Deserialize)]
#[diesel(table_name = teams)]
pub struct CreateTeam {
    pub name: Option<String>,
    pub website: Option<String>,
    pub about: Option<String>,
    pub no_of_seats: Option<i32>,
    pub metadata: Option<Value>,
}

#[derive(Debug, Queryable, Serialize, Deserialize)]
pub struct Team {
    pub id: Uuid,
    pub name: Option<String>,
    pub website: Option<String>,
    pub about: Option<String>,
    pub no_of_seats: Option<i32>,
    pub metadata: Option<Value>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>,
}
