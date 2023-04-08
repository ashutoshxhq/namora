use axum::{routing::post, Router};

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/authn/register", post(controller::register))
        .route("/authn/login", post(controller::login))
        .route("/authn/refresh-token", post(controller::refresh_token))
}
