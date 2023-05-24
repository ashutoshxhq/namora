use crate::state::NamoraAIState;
use axum::{
    extract::{Extension, Json, Path, Query},
    http::StatusCode,
    response::{IntoResponse, Redirect},
};
use serde_json::json;
use urlencoding::encode;
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
        Ok(_results) => Redirect::to("https://app.namora.ai/settings/integrations").into_response(),
        Err(err) => Redirect::to(&format!(
            "https://app.namora.ai/settings/integrations?error={}",
            encode(&err.to_string()).to_string()
        ))
        .into_response(),
    }
}

pub async fn get_integration_status(
    Extension(namora): Extension<NamoraAIState>,
    Path(team_id): Path<String>,
) -> impl IntoResponse {
    let team_id = Uuid::parse_str(&team_id);
    if team_id.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad user id in url"})),
        )
            .into_response();
    }
    let team_id = team_id.unwrap();

    let results = namora
        .services
        .nylas_integration
        .get_integration_status(team_id)
        .await;
    match results {
        Ok(results) => (
            StatusCode::OK,
            Json(json!({
                "data":results,
            })),
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
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
    tokio::spawn(async move {
        let results = namora
            .services
            .nylas_integration
            .messages_webhook(data)
            .await;
        match results {
            Ok(_results) => {
                tracing::info!("messages webhook processed successfully");
            }
            Err(err) => {
                tracing::error!("messages webhook failed to process: {}", err);
            }
        }
    });
    (
        StatusCode::OK,
        Json(json!({
            "status": "ok",
        })),
    )
}
