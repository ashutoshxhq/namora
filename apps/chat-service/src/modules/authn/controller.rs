use axum::{response::IntoResponse, Extension, Json};
use hyper::StatusCode;
use serde_json::json;

use crate::state::CodeGraphState;

use super::dto::{LoginRequestDTO, RefreshTokenRequestDTO, RegisterRequestDTO};

pub async fn register(
    Extension(app): Extension<CodeGraphState>,
    Json(data): Json<RegisterRequestDTO>,
) -> impl IntoResponse {
    let res = app.services.authn.register(data).await;
    match res {
        Ok(res) => (StatusCode::OK, Json(res)),
        Err(err) => (
            
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "error": err.to_string()
            })),
        ),
    }
}

pub async fn login(
    Extension(app): Extension<CodeGraphState>,
    Json(data): Json<LoginRequestDTO>,
) -> impl IntoResponse {
    let res = app.services.authn.login(data).await;
    match res {
        Ok(res) => (StatusCode::OK, Json(res)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "error": err.to_string()
            })),
        ),
    }
}

pub async fn refresh_token(
    Extension(app): Extension<CodeGraphState>,
    Json(data): Json<RefreshTokenRequestDTO>,
) -> impl IntoResponse {
    let res = app.services.authn.refresh_token(data).await;
    match res {
        Ok(res) => (StatusCode::OK, Json(res)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "error": err.to_string()
            })),
        ),
    }
}
