use axum::{extract::Path, response::IntoResponse, Extension, Json};
use hyper::StatusCode;
use serde_json::json;

use crate::state::NamoraAIState;

use super::types::{IndexMemoriesRequest, RetrieveMemoriesRequest};

pub async fn retrieve_memories(
    Extension(namora): Extension<NamoraAIState>,
    Path(_team_id): Path<String>,
    Json(data): Json<RetrieveMemoriesRequest>,
) -> impl IntoResponse {
    let res = namora.services.memory.retrieve_memories(data).await;

    match res {
        Ok(res) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
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

pub async fn index_memories(
    Extension(namora): Extension<NamoraAIState>,
    Path(_team_id): Path<String>,
    Json(data): Json<IndexMemoriesRequest>,
) -> impl IntoResponse {
    let res = namora.services.memory.index_memories(data).await;

    match res {
        Ok(_res) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
                "message": "Memories indexed successfully"
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
