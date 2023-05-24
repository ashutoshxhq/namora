use axum::{middleware, routing::*, Router};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route(
            "/teams/:team_id/integrations/nylas/status",
            get(controller::get_integration_status),
        )
        .route_layer(middleware::from_fn(auth))
        .route("/nylas/oauth/authorize", get(controller::nylas_authorize))
        .route("/nylas/oauth/callback", get(controller::nylas_callback))
        .route(
            "/nylas/webhooks/messages",
            get(controller::verify_nylas_webhook),
        )
        .route(
            "/nylas/webhooks/messages",
            post(controller::messages_webhook),
        )
}
