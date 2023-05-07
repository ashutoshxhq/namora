use axum::{Router, routing::*, middleware};

use crate::authz::auth;

use super::controller;

pub fn new() -> Router {
    Router::new()
        .route("/teams/:team_id/integrations/crm/link-token", post(controller::link_token))
        .route("/teams/:team_id/integrations/crm/exchange-token", post(controller::exchange_token))
        .route("/teams/:team_id/integrations/crm/connections/:connection_id", get(controller::get_connection))
        .route("/teams/:team_id/integrations/crm/connections/:connection_id", delete(controller::delete_connection))
        .route("/teams/:team_id/integrations/crm/objects/:object/describe", get(controller::describe_object))
        .route("/teams/:team_id/integrations/crm/objects/:object/search", get(controller::search_object_records))
        .route("/teams/:team_id/integrations/crm/objects/:object/:record_id", get(controller::get_object_record))
        .route("/teams/:team_id/integrations/crm/objects/:object", post(controller::create_object_record))
        .route("/teams/:team_id/integrations/crm/objects/:object/:record_id", patch(controller::update_object_record))
        .route_layer(middleware::from_fn(auth))
}
