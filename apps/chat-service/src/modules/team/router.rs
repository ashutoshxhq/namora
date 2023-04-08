use axum::{
    middleware,
    routing::{delete, get, patch},
    Router,
};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/teams/:team_id", get(controller::get_team))
        .route("/teams/:team_id", patch(controller::update_team))
        .route("/teams/:team_id", delete(controller::delete_team))
        .route_layer(middleware::from_fn(auth))
}
