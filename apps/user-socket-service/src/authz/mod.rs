use axum::{
    http::{header, Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use hyper::Uri;
use jsonwebtoken::{
    decode, decode_header,
    jwk::{AlgorithmParameters, JwkSet},
    Algorithm, DecodingKey, Validation,
};
use namora_core::types::error::Error;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub aud: Vec<String>,
    pub exp: i64,
    pub iat: i64,
    pub iss: String,
    pub sub: String,
    pub namora_user_id: Uuid,
    pub namora_team_id: Uuid,
    pub role: Option<String>,
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
            let claims = decode_token(auth_token).await;
            match claims {
                Ok(claims) => {
                    let mut new_req = Request::from_parts(parts, body);
                    new_req.extensions_mut().insert(claims.clone());
                    return next.run(new_req).await;
                }
                Err(e) => {
                    println!("error: {:?}", e);
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

pub async fn decode_token(token: &str) -> Result<Claims, Error> {
    let kid = get_kid_from_token(token)?;
    if let Some(kid) = kid {
        let jwks = reqwest::get(format!(
            "https://{}/.well-known/jwks.json",
            std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN")
        ))
        .await?
        .json::<JwkSet>()
        .await?;
        if let Some(jwk) = jwks.find(&kid) {
            match jwk.clone().algorithm {
                AlgorithmParameters::RSA(ref rsa) => {
                    let mut validation = Validation::new(Algorithm::RS256);
                    validation.set_audience(&[
                        &std::env::var("AUTH0_AUDIENCE").expect("Unable to get AUTH0_AUDIENCE")
                    ]);
                    validation.set_issuer(&[Uri::builder()
                        .scheme("https")
                        .authority(
                            std::env::var("AUTH0_DOMAIN").expect("Unable to get AUTH0_DOMAIN"),
                        )
                        .path_and_query("/")
                        .build()?]);
                    let key = DecodingKey::from_rsa_components(&rsa.n, &rsa.e)?;
                    let token_data = decode::<Claims>(token, &key, &validation)?;
                    return Ok(token_data.claims);
                }
                _ => return Err(Error::from("Unsupported algorithm")),
            }
        } else {
            return Err(Error::from("No matching kid found in jwks for token"));
        }
    } else {
        return Err(Error::from("No kid found in token headers"));
    }
}

pub fn get_kid_from_token(auth_token: &str) -> Result<Option<String>, Error> {
    let header = decode_header(&auth_token)?;
    Ok(header.kid)
}
