use axum::{routing::*, Router};

use super::controller;

pub fn new() -> Router {
    Router::new().route("/openapi.json", get(controller::get_document))
}
