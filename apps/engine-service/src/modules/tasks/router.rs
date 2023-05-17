use axum::{middleware, routing::*, Router};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/teams/:team_id/tasks", get(controller::get_tasks))
        .route("/teams/:team_id/tasks/:task_id", get(controller::get_task))
        .route("/teams/:team_id/tasks", post(controller::create_task))
        .route(
            "/teams/:team_id/tasks/:task_id",
            patch(controller::update_task),
        )
        .route(
            "/teams/:team_id/tasks/:task_id",
            delete(controller::delete_task),
        )
        .route_layer(middleware::from_fn(auth))
}
