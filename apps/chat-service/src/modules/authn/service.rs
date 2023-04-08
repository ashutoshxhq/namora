use super::dto::{Claims, LoginRequestDTO, RefreshTokenRequestDTO, RegisterRequestDTO};
use crate::error::CIQError;
use crate::modules::team::model::{CreateTeam, Team};
use crate::modules::user::model::{CreateUser, User};
use crate::schema::users::{email, username};
use crate::{error::Error, schema::teams::dsl::teams, schema::users::dsl::users, state::DbPool};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Days;
use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, PooledConnection},
};
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde_json::{json, Value};

#[derive(Clone)]
pub struct AuthNService {
    pub pool: DbPool,
}

impl AuthNService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub fn get_conn(&self) -> Result<PooledConnection<ConnectionManager<PgConnection>>, Error> {
        Ok(self.pool.get()?)
    }

    pub async fn login(&self, data: LoginRequestDTO) -> Result<Value, Error> {
        let result = users
            .filter(
                username
                    .eq(data.indentifier.clone())
                    .or(email.eq(data.indentifier)),
            )
            .first::<User>(&mut self.get_conn()?);

        match result {
            Ok(result_data) => {
                let valid = verify(data.password, &result_data.password)?;
                if !valid {
                    return Err(CIQError::new(
                        "WRONG_PASSWORD".to_string(),
                        "Email/Username or password incorrect".to_string(),
                        400,
                    ));
                }
                let accesss_token_claims = Claims {
                    aud: "http://api.codegraph.ai".to_string(),
                    exp: chrono::offset::Utc::now()
                        .checked_add_days(Days::new(1))
                        .unwrap()
                        .timestamp_millis(),
                    iat: chrono::offset::Utc::now().timestamp_millis(),
                    iss: "http://api.codegraph.ai".to_string(),
                    sub: result_data.email.clone(),
                    user_id: result_data.id,
                    team_id: result_data.team_id,
                    role: result_data.role.clone(),
                };
                let accesss_token = encode(
                    &Header::default(),
                    &accesss_token_claims,
                    &EncodingKey::from_secret(std::env::var("JWT_SECRET").expect("Please set JWT_SECRET in .env").as_bytes().as_ref()),
                )?;
                let refresh_token_claims = Claims {
                    aud: "http://api.codegraph.ai".to_string(),
                    exp: chrono::offset::Utc::now()
                        .checked_add_days(Days::new(90))
                        .unwrap()
                        .timestamp_millis(),
                    iat: chrono::offset::Utc::now().timestamp_millis(),
                    iss: "http://api.codegraph.ai".to_string(),
                    sub: result_data.email.clone(),
                    user_id: result_data.id,
                    team_id: result_data.team_id,
                    role: result_data.role.clone(),
                };
                let refresh_token = encode(
                    &Header::default(),
                    &refresh_token_claims,
                    &EncodingKey::from_secret(std::env::var("JWT_SECRET").expect("Please set JWT_SECRET in .env").as_bytes().as_ref()),
                )?;
                return Ok(json!({
                    "access_token":accesss_token,
                    "refresh_token":refresh_token,
                    "user_id":result_data.id.to_string(),
                    "team_id":result_data.team_id.to_string(),

                }));
            }
            Err(_err) => {
                return Err(CIQError::new(
                    "NO_USER_FOUND".to_string(),
                    "No account found with the given email/username".to_string(),
                    400,
                ));
            }
        }
    }

    pub async fn register(&self, data: RegisterRequestDTO) -> Result<Value, Error> {
        let created_team: Team = diesel::insert_into(teams)
            .values(CreateTeam {
                name: Some(data.company_name),
                about: None,
                metadata: None,
                no_of_seats: Some(1),
                website: None,
            })
            .get_result::<Team>(&mut self.get_conn()?)?;

        let created_user = diesel::insert_into(users)
            .values(CreateUser {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                username: data.username,
                password: hash(data.password, DEFAULT_COST)?,
                role: "OWNER".to_string(),
                team_id: created_team.id,
            })
            .get_result::<User>(&mut self.get_conn()?)?;

        let accesss_token_claims = Claims {
            aud: "http://api.codegraph.ai".to_string(),
            exp: chrono::offset::Utc::now()
                .checked_add_days(Days::new(1))
                .unwrap()
                .timestamp_millis(),
            iat: chrono::offset::Utc::now().timestamp_millis(),
            iss: "http://api.codegraph.ai".to_string(),
            sub: created_user.email.clone(),
            user_id: created_user.id,
            team_id: created_user.team_id,
            role: created_user.role.clone(),
        };
        let accesss_token = encode(
            &Header::default(),
            &accesss_token_claims,
            &EncodingKey::from_secret(std::env::var("JWT_SECRET").expect("Please set JWT_SECRET in .env").as_bytes().as_ref()),
        )?;
        let refresh_token_claims = Claims {
            aud: "http://api.codegraph.ai".to_string(),
            exp: chrono::offset::Utc::now()
                .checked_add_days(Days::new(90))
                .unwrap()
                .timestamp_millis(),
            iat: chrono::offset::Utc::now().timestamp_millis(),
            iss: "http://api.codegraph.ai".to_string(),
            sub: created_user.email.clone(),
            user_id: created_user.id,
            team_id: created_user.team_id,
            role: created_user.role.clone(),
        };
        let refresh_token = encode(
            &Header::default(),
            &refresh_token_claims,
            &EncodingKey::from_secret(std::env::var("JWT_SECRET").expect("Please set JWT_SECRET in .env").as_bytes().as_ref()),
        )?;
        return Ok(json!({
            "access_token":accesss_token,
            "refresh_token":refresh_token,
            "user_id":created_user.id.to_string(),
            "team_id":created_user.team_id.to_string(),

        }));
    }

    pub async fn refresh_token(&self, data: RefreshTokenRequestDTO) -> Result<Value, Error> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_issuer(&["https://api.codegraph.ai"]);
        let token_data = match decode::<Claims>(
            &data.refresh_token,
            &DecodingKey::from_secret(std::env::var("JWT_SECRET").expect("Please set JWT_SECRET in .env").as_bytes()),
            &validation,
        ) {
            Ok(c) => c,
            Err(err) => match *err.kind() {
                ErrorKind::InvalidToken => {
                    return Err(CIQError::new(
                        "BAD_TOKEN".to_string(),
                        "Invalid refresh token provided".to_string(),
                        400,
                    ))
                } // Example on how to handle a specific error
                ErrorKind::InvalidIssuer => {
                    return Err(CIQError::new(
                        "BAD_TOKEN".to_string(),
                        "Invalid issuer for refresh token".to_string(),
                        400,
                    ))
                } // Example on how to handle a specific error
                _ => {
                    return Err(CIQError::new(
                        "BAD_TOKEN".to_string(),
                        "Invalid refresh token provided".to_string(),
                        400,
                    ))
                }
            },
        };

        let user_data: User = users
            .find(token_data.claims.user_id)
            .first(&mut self.get_conn()?)?;

        let accesss_token_claims = Claims {
            aud: "http://api.codegraph.ai".to_string(),
            exp: chrono::offset::Utc::now()
                .checked_add_days(Days::new(1))
                .unwrap()
                .timestamp_millis(),
            iat: chrono::offset::Utc::now().timestamp_millis(),
            iss: "http://api.codegraph.ai".to_string(),
            sub: user_data.email.clone(),
            user_id: user_data.id,
            team_id: user_data.team_id,
            role: user_data.role.clone(),
        };

        let accesss_token = encode(
            &Header::default(),
            &accesss_token_claims,
            &EncodingKey::from_secret(std::env::var("JWT_SECRET").expect("Please set JWT_SECRET in .env").as_bytes().as_ref()),
        )?;
        Ok(json!({
            "access_token":accesss_token,
            "user_id":user_data.id.to_string(),
            "team_id":user_data.team_id.to_string(),
        }))
    }
}
