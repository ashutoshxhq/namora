use axum::{Router, routing::*, middleware};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/teams/:team_id/users", get(controller::get_users))
        .route("/teams/:team_id/users/:user_id", patch(controller::update_user))
        .route("/teams/:team_id/users/:user_id", delete(controller::delete_user))
        .route("/teams/:team_id/users/:user_id", get(controller::get_user))
        .route_layer(middleware::from_fn(auth))
}
