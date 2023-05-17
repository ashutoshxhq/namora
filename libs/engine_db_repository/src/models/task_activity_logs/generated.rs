/* This file is generated and managed by dsync */

use diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use diesel::r2d2::{PooledConnection, ConnectionManager};
use serde::{Deserialize, Serialize};
use crate::models::tasks::Task;
use crate::models::teams::Team;
use crate::models::users::User;

type Connection = PooledConnection<ConnectionManager<PgConnection>>;

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable)]
#[diesel(table_name=task_activity_logs, primary_key(id), belongs_to(Task, foreign_key=task_id) , belongs_to(Team, foreign_key=team_id) , belongs_to(User, foreign_key=user_id))]
pub struct TaskActivityLog {
    pub id: uuid::Uuid,
    pub activity_type: String,
    pub description: Option<String>,
    pub data: serde_json::Value,
    pub task_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=task_activity_logs)]
pub struct CreateTaskActivityLog {
    pub id: uuid::Uuid,
    pub activity_type: String,
    pub description: Option<String>,
    pub data: serde_json::Value,
    pub task_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=task_activity_logs)]
pub struct UpdateTaskActivityLog {
    pub activity_type: Option<String>,
    pub description: Option<Option<String>>,
    pub data: Option<serde_json::Value>,
    pub task_id: Option<uuid::Uuid>,
    pub user_id: Option<uuid::Uuid>,
    pub team_id: Option<uuid::Uuid>,
    pub created_at: Option<Option<chrono::NaiveDateTime>>,
    pub updated_at: Option<Option<chrono::NaiveDateTime>>,
    pub deleted_at: Option<Option<chrono::NaiveDateTime>>,
}


#[derive(Debug, Serialize)]
pub struct PaginationResult<T> {
    pub items: Vec<T>,
    pub total_items: i64,
    /// 0-based index
    pub page: i64,
    pub page_size: i64,
    pub num_pages: i64,
}

impl TaskActivityLog {

    pub fn create(db: &mut Connection, item: &CreateTaskActivityLog) -> QueryResult<Self> {
        use crate::schema::task_activity_logs::dsl::*;

        insert_into(task_activity_logs).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<Self> {
        use crate::schema::task_activity_logs::dsl::*;

        task_activity_logs.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::task_activity_logs::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = task_activity_logs.count().get_result(db)?;
        let items = task_activity_logs.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: uuid::Uuid, item: &UpdateTaskActivityLog) -> QueryResult<Self> {
        use crate::schema::task_activity_logs::dsl::*;

        diesel::update(task_activity_logs.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<usize> {
        use crate::schema::task_activity_logs::dsl::*;

        diesel::delete(task_activity_logs.filter(id.eq(param_id))).execute(db)
    }

}