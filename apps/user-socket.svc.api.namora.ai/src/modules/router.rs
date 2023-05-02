use super::{chat, health};
use axum::Router;

pub fn router() -> Router {
    Router::new()
        .merge(chat::router::new())
        .merge(health::router::new())
}
