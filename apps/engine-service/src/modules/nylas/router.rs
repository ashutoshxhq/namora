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
        .route("/integrations/nylas/oauth/authorize", get(controller::nylas_authorize))
        .route("/integrations/nylas/oauth/callback", get(controller::nylas_callback))
        .route(
            "/integrations/nylas/webhooks/messages",
            get(controller::verify_nylas_webhook),
        )
        .route(
            "/integrations/nylas/webhooks/messages",
            post(controller::messages_webhook),
        )
}
