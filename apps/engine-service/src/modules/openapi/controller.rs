use axum::{response::IntoResponse, Json};
use hyper::StatusCode;
use engine_db_repository::models::{
    tasks::{CreateTask, Task, UpdateTask},
    teams::{CreateTeam, Team, UpdateTeam},
    users::{CreateUser, UpdateUser, User},
};
use serde_json::Value;
use utoipa::{
    openapi::security::{Http, HttpAuthScheme, SecurityScheme},
    Modify, OpenApi,
};
use crate::tasks::controller::*;

#[derive(OpenApi)]
#[openapi(
        paths(
            get_tasks,
            get_task,
            create_task,
            update_task,
            delete_task,
            // get_users,
            // get_user,
            // update_user,
            // delete_user,
            // get_teams,
            // get_team,
            // update_team,
            // delete_team
        ),
        components(
            schemas(Task, CreateTask, UpdateTask, User, Team, CreateTeam, UpdateTeam, CreateUser, UpdateUser),
        ),
        modifiers(&SecurityAddon),
        tags(
            (name = "Tasks", description = "Task Management API")
        )
    )]
pub struct ApiDoc;

pub struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "Authorization",
                SecurityScheme::Http(Http::new(HttpAuthScheme::Bearer)),
            )
        }
    }
}


pub async fn get_document() -> impl IntoResponse {
    let docs = ApiDoc::openapi().to_json().unwrap();
    let json_doc: Value = serde_json::from_str(&docs).unwrap();
    (
        StatusCode::OK,
        Json(json_doc),
    ).into_response()
}