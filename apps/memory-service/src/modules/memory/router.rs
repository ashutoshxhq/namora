use axum::{routing, Router, middleware};
use crate::authz::auth;

use super::controller::{get_memories, create_memories};

pub fn new() -> Router {
    Router::new()
    .route("/teams/:team_id/memories", routing::get(get_memories))
    .route("/teams/:team_id/memories", routing::post(create_memories))
    .route_layer(middleware::from_fn(auth))
}
