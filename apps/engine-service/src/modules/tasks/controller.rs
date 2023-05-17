use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use engine_db_repository::models::tasks::{UpdateTask, CreateTask};
use serde_json::json;
use std::str::FromStr;
use uuid::Uuid;

use crate::{authz::Claims, state::NamoraAIState};

use super::types::GetTasksByQuery;

pub async fn get_task(
    Extension(namora): Extension<NamoraAIState>,
    Path((_team_id, task_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let task_id = Uuid::from_str(&task_id);
    match task_id {
        Ok(task_id) => {
            let res = namora.services.task.get_task(task_id).await;

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
                "error": "bad task id in url",
            })),
        ),
    }
}

pub async fn get_tasks(
    Extension(namora): Extension<NamoraAIState>,
    Extension(_claims): Extension<Claims>,
    query: Query<GetTasksByQuery>,
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
        .task
        .get_tasks(query.offset, query.limit, team_id.unwrap());
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

pub async fn create_task(
    Extension(namora): Extension<NamoraAIState>,
    Path(_team_id): Path<String>,
    Json(data): Json<CreateTask>,
) -> impl IntoResponse {
    let res = namora.services.task.create_task(data).await;

    match res {
        Ok(res) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
                "message": "task created successfully",
                "data": res
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

pub async fn update_task(
    Extension(namora): Extension<NamoraAIState>,
    Path((_team_id, task_id)): Path<(String, String)>,
    Json(data): Json<UpdateTask>,
) -> impl IntoResponse {
    let task_id = Uuid::from_str(&task_id);
    match task_id {
        Ok(task_id) => {
            let res = namora.services.task.update_task(task_id, data).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "task updated successfully",
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
                "error": "bad task id in url",
            })),
        ),
    }
}

pub async fn delete_task(
    Extension(namora): Extension<NamoraAIState>,
    Path((_team_id, task_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let task_id = Uuid::from_str(&task_id);
    match task_id {
        Ok(task_id) => {
            let res = namora.services.task.delete_task(task_id).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "task deleted successfully",
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
                "error": "bad task id in url",
            })),
        ),
    }
}
