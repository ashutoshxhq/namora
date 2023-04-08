use axum::{
    middleware,
    routing::{delete, get, patch, post},
    Router,
};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/teams/:team_id/users/:id", get(controller::get_user))
        .route("/teams/:team_id/users", get(controller::get_users))
        .route("/teams/:team_id/users", post(controller::invite_user))
        .route("/teams/:team_id/users/:id", patch(controller::update_user))
        .route("/teams/:team_id/users/:id", delete(controller::delete_user))
        .route_layer(middleware::from_fn(auth))
}
