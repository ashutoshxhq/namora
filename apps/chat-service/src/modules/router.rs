use axum::Router;
use super::{authn, health, team, user, chat};

pub fn router() -> Router {
    Router::new()
        .merge(authn::router::new())
        .merge(user::router::new())
        .merge(team::router::new())
        .merge(chat::router::new())
        .merge(health::router::new())
}
