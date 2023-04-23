use axum::{
    http::{header, Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub aud: String,
    pub exp: i64,
    pub iat: i64,
    pub iss: String,
    pub sub: String,
    pub user_id: Uuid,
    pub team_id: Uuid,
    pub role: String,
}

pub async fn auth<B>(req: Request<B>, next: Next<B>) -> Response {
    let (parts, body) = req.into_parts();
    let headers = parts.headers.clone();

    let auth_header = headers
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    if let Some(auth_header) = auth_header {
        let auth_token = auth_header.split(" ").last();
        if let Some(auth_token) = auth_token {
            let mut validation = Validation::new(Algorithm::HS256);
            validation.set_issuer(&["https://api.NamoraAI.app"]);
            let token_data =
                match decode::<Claims>(
                    auth_token,
                    &DecodingKey::from_secret(
                        std::env::var("JWT_SECRET")
                            .expect("Please set JWT_SECRET in .env")
                            .as_bytes(),
                    ),
                    &validation,
                ) {
                    Ok(c) => c,
                    Err(err) => {
                        match *err.kind() {
                            ErrorKind::InvalidToken => return (
                                StatusCode::UNAUTHORIZED,
                                Json(json!({
                                    "error": "UNAUTHORIZED",
                                    "status": "error",
                                    "message": "Unauthorized: please provide a valid auth token",
                                })),
                            )
                                .into_response(), // Example on how to handle a specific error
                            ErrorKind::InvalidIssuer => return (
                                StatusCode::UNAUTHORIZED,
                                Json(json!({
                                    "error": "UNAUTHORIZED",
                                    "status": "error",
                                    "message": "Unauthorized: please provide a valid auth token",
                                })),
                            )
                                .into_response(), // Example on how to handle a specific error
                            _ => return (
                                StatusCode::UNAUTHORIZED,
                                Json(json!({
                                    "error": "UNAUTHORIZED",
                                    "status": "error",
                                    "message": "Unauthorized: please provide a valid auth token",
                                })),
                            )
                                .into_response(),
                        }
                    }
                };
            let mut new_req = Request::from_parts(parts, body);
            new_req.extensions_mut().insert(token_data.claims);
            return next.run(new_req).await;
        } else {
            println!("no token");
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
    } else {
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
