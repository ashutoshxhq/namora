use crate::state::CodeGraphState;
use axum::{extract::Path, http::StatusCode, response::IntoResponse, Extension, Json};
use serde_json::json;
use std::str::FromStr;
use uuid::Uuid;

use super::model::UpdateTeam;

pub async fn get_team(
    Extension(app): Extension<CodeGraphState>,
    Path(team_id): Path<String>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&team_id);
    match team_id {
        Ok(team_id) => {
            let res = app.services.team.get_team(team_id).await;

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
    Extension(app): Extension<CodeGraphState>,
    Path(team_id): Path<String>,
    Json(data): Json<UpdateTeam>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&team_id);
    match team_id {
        Ok(team_id) => {
            let res = app.services.team.update_team(team_id, data).await;

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
    Extension(app): Extension<CodeGraphState>,
    Path(team_id): Path<String>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&team_id);
    match team_id {
        Ok(team_id) => {
            let res = app.services.team.delete_team(team_id).await;

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
