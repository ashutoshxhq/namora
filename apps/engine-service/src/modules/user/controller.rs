use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use engine_db_repository::models::users::UpdateUser;
use serde_json::json;
use std::str::FromStr;
use uuid::Uuid;

use crate::{authz::Claims, state::NamoraAIState};

use super::types::GetUsersByQuery;

pub async fn get_user(
    Extension(namora): Extension<NamoraAIState>,
    Path((_team_id, user_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let user_id = Uuid::from_str(&user_id);
    match user_id {
        Ok(user_id) => {
            let res = namora.services.user.get_user(user_id).await;

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
                "error": "bad user id in url",
            })),
        ),
    }
}

pub async fn get_users(
    Extension(namora): Extension<NamoraAIState>,
    Extension(_claims): Extension<Claims>,
    query: Query<GetUsersByQuery>,
    Path(team_id): Path<String>,
) -> impl IntoResponse {
    let team_id = Uuid::from_str(&team_id);
    if team_id.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let res = namora
        .services
        .user
        .get_users(query.offset, query.limit, team_id.unwrap());
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

pub async fn update_user(
    Extension(_namora): Extension<NamoraAIState>,
    Path((_team_id, user_id)): Path<(String, String)>,
    Json(data): Json<UpdateUser>,
) -> impl IntoResponse {
    let user_id = Uuid::from_str(&user_id);
    match user_id {
        Ok(user_id) => {
            let res = _namora.services.user.update_user(user_id, data).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "user updated successfully",
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
                "error": "bad user id in url",
            })),
        ),
    }
}

pub async fn delete_user(
    Extension(_namora): Extension<NamoraAIState>,
    Path((_team_id, user_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let user_id = Uuid::from_str(&user_id);
    match user_id {
        Ok(user_id) => {
            let res = _namora.services.user.delete_user(user_id).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "user deleted successfully",
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
                "error": "bad user id in url",
            })),
        ),
    }
}
