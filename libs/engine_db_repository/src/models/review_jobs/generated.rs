/* This file is generated and managed by dsync */

use diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use diesel::r2d2::{PooledConnection, ConnectionManager};
use serde::{Deserialize, Serialize};
use crate::models::teams::Team;
use crate::models::users::User;

type Connection = PooledConnection<ConnectionManager<PgConnection>>;

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable)]
#[diesel(table_name=review_jobs, primary_key(id), belongs_to(Team, foreign_key=team_id) , belongs_to(User, foreign_key=user_id))]
pub struct ReviewJob {
    pub id: uuid::Uuid,
    pub name: String,
    pub plan: serde_json::Value,
    pub status: String,
    pub trigger: serde_json::Value,
    pub user_id: uuid::Uuid,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=review_jobs)]
pub struct CreateReviewJob {
    pub id: uuid::Uuid,
    pub name: String,
    pub plan: serde_json::Value,
    pub status: String,
    pub trigger: serde_json::Value,
    pub user_id: uuid::Uuid,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=review_jobs)]
pub struct UpdateReviewJob {
    pub name: Option<String>,
    pub plan: Option<serde_json::Value>,
    pub status: Option<String>,
    pub trigger: Option<serde_json::Value>,
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

impl ReviewJob {

    pub fn create(db: &mut Connection, item: &CreateReviewJob) -> QueryResult<Self> {
        use crate::schema::review_jobs::dsl::*;

        insert_into(review_jobs).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<Self> {
        use crate::schema::review_jobs::dsl::*;

        review_jobs.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::review_jobs::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = review_jobs.count().get_result(db)?;
        let items = review_jobs.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: uuid::Uuid, item: &UpdateReviewJob) -> QueryResult<Self> {
        use crate::schema::review_jobs::dsl::*;

        diesel::update(review_jobs.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<usize> {
        use crate::schema::review_jobs::dsl::*;

        diesel::delete(review_jobs.filter(id.eq(param_id))).execute(db)
    }

}