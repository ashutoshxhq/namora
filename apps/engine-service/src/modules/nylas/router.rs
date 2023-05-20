use axum::{Router, routing::*, middleware};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/teams/:team_id/integrations/nylas/oauth/authorize", get(controller::nylas_authorize))
        .route_layer(middleware::from_fn(auth))
        .route("/nylas/oauth/callback", get(controller::nylas_callback))
}
