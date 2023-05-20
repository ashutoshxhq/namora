use crate::{state::NamoraAIState, authz::Claims};
use axum::{
    extract::{Extension, Json, Path, Query},
    http::StatusCode,
    response::{IntoResponse, Redirect},
};
use serde_json::json;
use uuid::Uuid;

use super::types::AuthorizationCodeRequestQuery;

pub async fn nylas_authorize(
    Extension(namora): Extension<NamoraAIState>,
    Extension(claims): Extension<Claims>,
    Path(team_id): Path<String>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        )
            .into_response();
    }
    let team_id = team_id_res.unwrap();
    let result = namora
        .services
        .nylas_integration
        .get_nylas_authorize_url(team_id, claims.namora_user_id)
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
    Path(team_id): Path<String>,
    Query(query): Query<AuthorizationCodeRequestQuery>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        )
            .into_response();
    }
    let team_id = team_id_res.unwrap();

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
        .exchange_code_for_token(user_id, team_id, query.code)
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
