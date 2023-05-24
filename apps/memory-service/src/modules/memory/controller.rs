use axum::{extract::Path, response::IntoResponse, Extension, Json};
use hyper::StatusCode;
use serde_json::json;
use uuid::Uuid;

use crate::state::NamoraAIState;

use super::types::{IndexMemoriesRequest, RetrieveMemoriesRequest};

pub async fn get_memories(
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

pub async fn create_memories(
    Extension(namora): Extension<NamoraAIState>,
    Path(team_id): Path<String>,
    Json(data): Json<IndexMemoriesRequest>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let res = namora.services.memory.index_memories(team_id, data).await;

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
