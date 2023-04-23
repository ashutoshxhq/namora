use axum::{response::IntoResponse, Json};
use hyper::StatusCode;
use serde_json::json;

pub async fn health() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "ok",
        })),
    )
}
