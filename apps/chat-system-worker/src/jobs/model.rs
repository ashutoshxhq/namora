use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use uuid::Uuid;

use crate::schema::{jobs, review_artifacts};

#[derive(Debug, Insertable, Serialize, Deserialize)]
#[diesel(table_name = jobs)]
pub struct NewJob {
    pub name: String,
    pub plan: Value,
    pub status: String,
    pub trigger: Value,
    pub user_id: Uuid,
    pub team_id: Uuid,
}

#[derive(Debug, AsChangeset, Serialize, Deserialize)]
#[diesel(table_name = jobs)]
pub struct UpdateJob {
    pub name: String,
    pub plan: Value,
    pub status: String,
    pub trigger: Value,
    pub user_id: Uuid,
    pub team_id: Uuid,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Queryable)]
#[diesel(table_name = jobs)]
pub struct Job {
    pub id: Uuid,
    pub name: String,
    pub plan: Value,
    pub status: String,
    pub trigger: Value,
    pub user_id: Uuid,
    pub team_id: Uuid,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Debug, Insertable, Serialize, Deserialize)]
#[diesel(table_name = review_artifacts)]
pub struct NewReviewArtifact {
    pub artifact_type: String,
    pub data: Value,
    pub status: String,
    pub job_id: Uuid,
    pub team_id: Uuid,
}

#[derive(Debug, AsChangeset, Serialize, Deserialize)]
#[diesel(table_name = review_artifacts)]
pub struct UpdateReviewArtifact{
    pub artifact_type: String,
    pub data: Value,
    pub status: String,
    pub job_id: Uuid,
    pub team_id: Uuid,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Queryable)]
#[diesel(table_name = review_artifacts)]
pub struct ReviewArtifacts {
    pub id: Uuid,
    pub artifact_type: String,
    pub data: Value,
    pub status: String,
    pub job_id: Uuid,
    pub team_id: Uuid,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub deleted_at: Option<NaiveDateTime>,
}