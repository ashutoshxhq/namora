use super::{health};
use axum::Router;

pub fn router() -> Router {
    Router::new()
        .merge(health::router::new())
}
