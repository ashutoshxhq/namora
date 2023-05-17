use axum::{routing, Router, middleware};
use crate::authz::auth;

use super::controller::health;

pub fn new() -> Router {
    Router::new()
    .route_layer(middleware::from_fn(auth))
    .route("/health", routing::get(health))
}
