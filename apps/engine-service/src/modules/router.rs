use super::{health, authn, user, team, crm, tasks, openapi};
use axum::Router;

pub fn router() -> Router {
    Router::new()
        .merge(health::router::new())
        .merge(openapi::router::new())
        .merge(authn::router::new())
        .merge(user::router::new())
        .merge(team::router::new())
        .merge(crm::router::new())
        .merge(tasks::router::new())
}
