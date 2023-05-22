/* This file is generated and managed by dsync */

use diesel::{*, r2d2::{PooledConnection, ConnectionManager}};
use crate::schema::*;
use diesel::QueryResult;
use serde::{Deserialize, Serialize};
use crate::models::teams::Team;
use crate::models::users::User;

type Connection = PooledConnection<ConnectionManager<PgConnection>>;

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable)]
#[diesel(table_name=tasks, primary_key(id), belongs_to(Team, foreign_key=team_id) , belongs_to(User, foreign_key=user_id))]
pub struct Task {
    pub id: uuid::Uuid,
    pub task_type: String,
    pub title: String,
    pub description: Option<String>,
    pub plan: Option<serde_json::Value>,
    pub trigger: Option<serde_json::Value>,
    pub status: String,
    pub user_id: uuid::Uuid,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=tasks)]
pub struct CreateTask {
    pub task_type: String,
    pub title: String,
    pub description: Option<String>,
    pub plan: Option<serde_json::Value>,
    pub trigger: Option<serde_json::Value>,
    pub status: String,
    pub user_id: uuid::Uuid,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=tasks)]
pub struct UpdateTask {
    pub task_type: Option<String>,
    pub title: Option<String>,
    pub description: Option<Option<String>>,
    pub plan: Option<Option<serde_json::Value>>,
    pub trigger: Option<Option<serde_json::Value>>,
    pub status: Option<String>,
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

impl Task {

    pub fn create(db: &mut Connection, item: &CreateTask) -> QueryResult<Self> {
        use crate::schema::tasks::dsl::*;

        insert_into(tasks).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<Self> {
        use crate::schema::tasks::dsl::*;

        tasks.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::tasks::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = tasks.count().get_result(db)?;
        let items = tasks.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: uuid::Uuid, item: &UpdateTask) -> QueryResult<Self> {
        use crate::schema::tasks::dsl::*;

        diesel::update(tasks.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<usize> {
        use crate::schema::tasks::dsl::*;

        diesel::delete(tasks.filter(id.eq(param_id))).execute(db)
    }

}