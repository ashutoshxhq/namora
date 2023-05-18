use axum::{routing, Router, middleware};
use crate::authz::auth;

use super::controller::{retrieve_memories, index_memories};

pub fn new() -> Router {
    Router::new()
    .route("/teams/:team_id/retrieve-memories", routing::post(retrieve_memories))
    .route("/teams/:team_id/index-memories", routing::post(index_memories))
    .route_layer(middleware::from_fn(auth))
}
