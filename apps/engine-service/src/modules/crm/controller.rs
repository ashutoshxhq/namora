use axum::{
    extract::{Extension, Json, Path, Query},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::state::NamoraAIState;

use super::types::{ExchangeTokenRequest, SearchObjectRecordsRequest};

pub async fn link_token(
    Extension(namora): Extension<NamoraAIState>,
    Path(team_id): Path<String>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora.services.crm_integration.link_token(team_id).await;
    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn exchange_token(
    Extension(namora): Extension<NamoraAIState>,
    Path(team_id): Path<String>,
    Json(data): Json<ExchangeTokenRequest>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
        .services
        .crm_integration
        .exchange_token(data.public_token, team_id)
        .await;
    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn get_connection(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, connection_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
        .services
        .crm_integration
        .get_connection(connection_id, team_id)
        .await;
    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn delete_connection(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, connection_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
        .services
        .crm_integration
        .delete_connection(connection_id, team_id)
        .await;
    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn describe_object(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, object)): Path<(String, String)>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
        .services
        .crm_integration
        .describe_object(object, team_id)
        .await;

    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn search_object_records(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, object)): Path<(String, String)>,
    Query(query): Query<SearchObjectRecordsRequest>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let filter_res = serde_json::to_value(query.filter.unwrap_or("{}".to_string()));
    if filter_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad filter in url"})),
        );
    }
    let filter = filter_res.unwrap();
    let limit = query.limit.unwrap_or(10);
    let cursor = query.cursor.unwrap_or("".to_string());
    let all_fields = query.all_fields.unwrap_or(false);

    let results = namora
        .services
        .crm_integration
        .search_object_records(object, filter, limit, cursor, all_fields, team_id)
        .await;

    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn get_object_record(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, object, record_id)): Path<(String, String, String)>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
        .services
        .crm_integration
        .get_object_record(object, record_id, false, team_id)
        .await;

    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn create_object_record(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, object)): Path<(String, String)>,
    Json(data): Json<Value>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
        .services
        .crm_integration
        .create_object_record(object, data, team_id)
        .await;

    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}

pub async fn update_object_record(
    Extension(namora): Extension<NamoraAIState>,
    Path((team_id, object, record_id)): Path<(String, String, String)>,
    Json(data): Json<Value>,
) -> impl IntoResponse {
    let team_id_res = Uuid::parse_str(&team_id);
    if team_id_res.is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error":"bad team id in url"})),
        );
    }
    let team_id = team_id_res.unwrap();
    let results = namora
    .services
    .crm_integration.update_object_record(object, record_id, data, team_id).await;

    match results {
        Ok(results) => (StatusCode::OK, Json(results)),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error":err.to_string()})),
        ),
    }
}
