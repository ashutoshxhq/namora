use crate::{authz::decode_token, state::NamoraAIState};
use axum::{
    extract::{Query, WebSocketUpgrade},
    response::IntoResponse,
    Extension, Json
};
use hyper::StatusCode;
use serde_json::json;

use super::{agent::generic_agent_socket, types::WebSocketQuery};

pub async fn generic_agent(
    Extension(app): Extension<NamoraAIState>,
    query: Query<WebSocketQuery>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    let auth_token = query.token.clone();
    let claims = decode_token(&auth_token).await;
    match claims {
        Ok(claims) => ws.on_upgrade(move |socket| async move {
            let res = generic_agent_socket(app, socket, claims, auth_token.to_string()).await;
            if let Err(e) = res {
                tracing::error!("websocket error: {}", e);
            }
        }),
        Err(e) => {
            tracing::error!("error: {:?}", e);
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({
                    "error": "UNAUTHORIZED",
                    "status": "error",
                    "message": "Unauthorized: please provide a valid auth token",
                })),
            )
                .into_response();
        }
    }
}
