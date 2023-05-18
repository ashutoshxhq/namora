use super::{health, memory};
use axum::Router;

pub fn router() -> Router {
    Router::new()
        .merge(health::router::new())
        .merge(memory::router::new())
}
