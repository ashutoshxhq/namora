use crate::{modules::authn::dto::Claims, state::CodeGraphState};
use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use bcrypt::{hash, DEFAULT_COST};
use serde_json::json;
use std::str::FromStr;
use uuid::Uuid;

use super::{
    dto::{GetUsersByQuery, InviteUser},
    model::{CreateUser, UpdateUser},
};

pub async fn get_user(
    Extension(app): Extension<CodeGraphState>,
    Path((_team_id, user_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let user_id = Uuid::from_str(&user_id);
    match user_id {
        Ok(user_id) => {
            let res = app.services.user.get_user(user_id).await;

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
                "error": "bad user id in url",
            })),
        ),
    }
}

pub async fn get_users(
    Extension(app): Extension<CodeGraphState>,
    Extension(_claims): Extension<Claims>,
    query: Query<GetUsersByQuery>,
) -> impl IntoResponse {
    let res = app
        .services
        .user
        .get_users(query.query.clone(), query.offset, query.limit);
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

pub async fn invite_user(
    Extension(app): Extension<CodeGraphState>,
    Extension(claims): Extension<Claims>,
    Json(data): Json<InviteUser>,
) -> impl IntoResponse {
    let res = app
        .services
        .user
        .create_user(CreateUser {
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            email: data.email,
            password: hash(data.password, DEFAULT_COST).unwrap(),
            role: data.role,
            team_id: claims.team_id,
        })
        .await;

    match res {
        Ok(_res) => (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
                "data": "user invited successfully",
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

pub async fn update_user(
    Extension(app): Extension<CodeGraphState>,
    Path((_team_id, user_id)): Path<(String, String)>,
    Json(data): Json<UpdateUser>,
) -> impl IntoResponse {
    let user_id = Uuid::from_str(&user_id);
    match user_id {
        Ok(user_id) => {
            let res = app.services.user.update_user(user_id, data).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "user updated successfully",
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
                "error": "bad user id in url",
            })),
        ),
    }
}

pub async fn delete_user(
    Extension(app): Extension<CodeGraphState>,
    Path((_team_id, user_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let user_id = Uuid::from_str(&user_id);
    match user_id {
        Ok(user_id) => {
            let res = app.services.user.delete_user(user_id).await;

            match res {
                Ok(_res) => (
                    StatusCode::OK,
                    Json(json!({
                        "status": "ok",
                        "data": "user deleted successfully",
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
                "error": "bad user id in url",
            })),
        ),
    }
}
