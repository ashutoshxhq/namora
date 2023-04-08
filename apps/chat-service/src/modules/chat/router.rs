use axum::{middleware, routing::get, Router};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route_layer(middleware::from_fn(auth))
        .route("/", get(controller::generic_agent))
}
