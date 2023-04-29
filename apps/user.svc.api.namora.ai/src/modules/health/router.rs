use axum::{routing, Router};
use super::controller::health;

pub fn new() -> Router {
    Router::new().route("/health", routing::get(health))
}
