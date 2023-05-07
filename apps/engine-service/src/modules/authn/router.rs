use axum::{Router, routing::post};

use super::controller;

pub fn new() -> Router {
    Router::new().route(
        "/authn/register-webhook",
        post(controller::register_webhook),
    )
}
