use super::{health, authn, user, team};
use axum::Router;

pub fn router() -> Router {
    Router::new()
        .merge(health::router::new())
        .merge(authn::router::new())
        .merge(user::router::new())
        .merge(team::router::new())
}
