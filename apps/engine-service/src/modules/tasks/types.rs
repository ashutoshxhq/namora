use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct GetTasksByQuery {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}


#[derive(Deserialize, Serialize)]
pub struct MetaData {
    pub total: i64,
    pub current_offset: i64,
    pub current_limit: i64,
    pub result_count: i64,
}

#[derive(Deserialize, Serialize)]
pub struct PaginatedResult<T> {
    pub data: T,
    pub meta_data: MetaData,
}
