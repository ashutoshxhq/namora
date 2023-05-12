use axum::{response::IntoResponse, Extension, Json};
use hyper::StatusCode;
use serde_json::json;

use crate::state::NamoraAIState;

use super::types::RegisterWebhookRequest;

pub async fn register_webhook(
    Extension(namora): Extension<NamoraAIState>,
    Json(data): Json<RegisterWebhookRequest>,
) -> impl IntoResponse {
    let res = namora.services.authn.register_webhook(data).await;
    match res {
        Ok(res) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
                "data": res
            })),
        ),
        Err(err) => {
            tracing::error!("Error registering webhook: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "status": "error",
                    "error": err.to_string()
                })),
            )
        }
    }
}
