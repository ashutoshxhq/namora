use crate::state::NamoraAIState;
use axum::{
    extract::{Extension, Json, Query},
    http::StatusCode,
    response::{IntoResponse, Redirect},
};
use serde_json::json;
use uuid::Uuid;

use super::types::{
    AuthorizationCodeRequestQuery, NylasAuthorizeRequest, NylasVerifyWebhookRequest,
    NylasWebhookMessages,
};

pub async fn nylas_authorize(
    Extension(namora): Extension<NamoraAIState>,
    Query(query): Query<NylasAuthorizeRequest>,
) -> impl IntoResponse {
    let user_id_res = Uuid::parse_str(&query.user_id);
    if user_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        )
            .into_response();
    }
    let user_id = user_id_res.unwrap();

    let result = namora
        .services
        .nylas_integration
        .get_nylas_authorize_url(user_id)
        .await;
    match result {
        Ok(result) => Redirect::to(&result.redirect_url).into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": err.to_string() })),
        )
            .into_response(),
    }
}

pub async fn nylas_callback(
    Extension(namora): Extension<NamoraAIState>,
    Query(query): Query<AuthorizationCodeRequestQuery>,
) -> impl IntoResponse {
    let user_id = Uuid::parse_str(&query.state);
    if user_id.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad user id in url"})),
        )
            .into_response();
    }
    let user_id = user_id.unwrap();

    let results = namora
        .services
        .nylas_integration
        .exchange_code_for_token(user_id, query.code)
        .await;
    match results {
        Ok(_results) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
            })),
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": err.to_string() })),
        )
            .into_response(),
    }
}

pub async fn verify_nylas_webhook(
    Query(query): Query<NylasVerifyWebhookRequest>,
) -> impl IntoResponse {
    (StatusCode::OK, query.challenge)
}

pub async fn messages_webhook(
    Extension(namora): Extension<NamoraAIState>,
    Json(data): Json<NylasWebhookMessages>,
) -> impl IntoResponse {
    let results = namora
        .services
        .nylas_integration
        .messages_webhook(data)
        .await;
    match results {
        Ok(_results) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
            })),
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": err.to_string() })),
        )
            .into_response(),
    }
}
