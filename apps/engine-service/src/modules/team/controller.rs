use axum::{extract::Path, http::StatusCode, response::IntoResponse, Extension, Json};
use engine_db_repository::models::teams::UpdateTeam;
use serde_json::json;
use std::str::FromStr;
use uuid::Uuid;

use crate::state::NamoraAIState;

pub async fn get_team(
    Extension(namora): Extension<NamoraAIState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&id);
    match team_id {
        Ok(team_id) => {
            let res = namora.services.team.get_team(team_id).await;

            match res {
                Ok(res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": res,
                    })),
                ),
                Err(err) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": err.to_string()
                    })),
                ),
            }
        }
        Err(_err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "error": "bad team id in url",
            })),
        ),
    }
}

pub async fn update_team(
    Extension(_namora): Extension<NamoraAIState>,
    Path(id): Path<String>,
    Json(data): Json<UpdateTeam>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&id);
    match team_id {
        Ok(team_id) => {
            let res = _namora.services.team.update_team(team_id, data).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "team updated successfully",
                    })),
                ),
                Err(err) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": err.to_string()
                    })),
                ),
            }
        }
        Err(_err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "error": "bad team id in url",
            })),
        ),
    }
}

pub async fn delete_team(
    Extension(_namora): Extension<NamoraAIState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&id);
    match team_id {
        Ok(team_id) => {
            let res = _namora.services.team.delete_team(team_id).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "team deleted successfully",
                    })),
                ),
                Err(err) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({
                        "status": "error",
                        "error": err.to_string()
                    })),
                ),
            }
        }
        Err(_err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "error": "bad team id in url",
            })),
        ),
    }
}
