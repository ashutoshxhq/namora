use axum::{middleware, routing::*, Router};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route_layer(middleware::from_fn(auth))
        .route(
            "/nylas/oauth/authorize",
            get(controller::nylas_authorize),
        )
        .route("/nylas/oauth/callback", get(controller::nylas_callback))
}
