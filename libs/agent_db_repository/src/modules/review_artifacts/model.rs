use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use crate::schema::review_artifacts;

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
pub struct UpdateReviewArtifact {
    pub artifact_type: String,
    pub data: Value,
    pub status: String,
    pub job_id: Uuid,
    pub team_id: Uuid,
    pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Queryable)]
#[diesel(table_name = review_artifacts)]
pub struct ReviewArtifact {
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
