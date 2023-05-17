use serde::Deserialize;

#[derive(Deserialize)]
pub struct GetTasksByQuery {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}
