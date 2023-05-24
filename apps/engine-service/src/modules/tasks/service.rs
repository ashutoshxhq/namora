use diesel::prelude::*;
use engine_db_repository::{
    models::tasks::{CreateTask, Task, UpdateTask},
    schema::tasks::dsl,
};
use namora_core::types::{db::DbPool, error::Error};
use uuid::Uuid;

use super::types::{PaginatedResult, MetaData};

#[derive(Clone)]
pub struct TaskService {
    pub pool: DbPool,
}

impl TaskService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn get_task(&self, task_id: Uuid) -> Result<Task, Error> {
        let mut conn = self.pool.clone().get()?;
        let results: Task = dsl::tasks.find(task_id).first(&mut conn)?;
        Ok(results)
    }

    pub fn get_tasks(
        &self,
        offset: Option<i64>,
        limit: Option<i64>,
        team_id: Uuid,
    ) -> Result<PaginatedResult<Vec<Task>>, Error> {
        let mut conn = self.pool.clone().get()?;
        let offset = if let Some(offset) = offset { offset } else { 0 };
        let limit = if let Some(limit) = limit { limit } else { 10 };

        let total = dsl::tasks
            .filter(dsl::team_id.eq(team_id))
            .count()
            .get_result(&mut conn)?;

        let results: Vec<Task> = dsl::tasks
            .filter(dsl::team_id.eq(team_id))
            .offset(offset)
            .limit(limit)
            .load(&mut conn)?;
        let res_len = results.len();
        
        Ok(PaginatedResult { data: results, meta_data: MetaData{
            current_limit: limit,
            current_offset: offset,
            result_count: res_len as i64,
            total
        } })
    }

    pub async fn create_task(&self, data: CreateTask) -> Result<Task, Error> {
        let mut conn = self.pool.clone().get()?;
        let task = diesel::insert_into(dsl::tasks)
            .values(data)
            .get_result::<Task>(&mut conn)?;
        Ok(task)
    }

    pub async fn update_task(&self, task_id: Uuid, data: UpdateTask) -> Result<Task, Error> {
        let mut conn = self.pool.clone().get()?;
        let task = diesel::update(dsl::tasks.find(task_id))
            .set(&data)
            .get_result::<Task>(&mut conn)?;
        Ok(task)
    }

    pub async fn delete_task(&self, task_id: Uuid) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        diesel::delete(dsl::tasks.find(task_id)).execute(&mut conn)?;
        Ok(())
    }
}
