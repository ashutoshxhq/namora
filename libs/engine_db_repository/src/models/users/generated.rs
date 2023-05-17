/* This file is generated and managed by dsync */

use diesel::*;
use utoipa::ToSchema;
use crate::schema::*;
use diesel::QueryResult;
use diesel::r2d2::{PooledConnection, ConnectionManager};
use serde::{Deserialize, Serialize};
use crate::models::teams::Team;

type Connection = PooledConnection<ConnectionManager<PgConnection>>;

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable, ToSchema)]
#[diesel(table_name=users, primary_key(id), belongs_to(Team, foreign_key=team_id))]
pub struct User {
    pub id: uuid::Uuid,
    pub firstname: Option<String>,
    pub lastname: Option<String>,
    pub email: Option<String>,
    pub username: Option<String>,
    pub company_position: Option<String>,
    pub position_description: Option<String>,
    pub role: String,
    pub credits: Option<i32>,
    pub connection: Option<String>,
    pub idp_user_id: String,
    pub profile_pic: Option<String>,
    pub readme: Option<String>,
    pub timezone: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, ToSchema)]
#[diesel(table_name=users)]
pub struct CreateUser {
    pub id: uuid::Uuid,
    pub firstname: Option<String>,
    pub lastname: Option<String>,
    pub email: Option<String>,
    pub username: Option<String>,
    pub company_position: Option<String>,
    pub position_description: Option<String>,
    pub role: String,
    pub credits: Option<i32>,
    pub connection: Option<String>,
    pub idp_user_id: String,
    pub profile_pic: Option<String>,
    pub readme: Option<String>,
    pub timezone: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub team_id: uuid::Uuid,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, ToSchema)]
#[diesel(table_name=users)]
pub struct UpdateUser {
    pub firstname: Option<Option<String>>,
    pub lastname: Option<Option<String>>,
    pub email: Option<Option<String>>,
    pub username: Option<Option<String>>,
    pub company_position: Option<Option<String>>,
    pub position_description: Option<Option<String>>,
    pub role: Option<String>,
    pub credits: Option<Option<i32>>,
    pub connection: Option<Option<String>>,
    pub idp_user_id: Option<String>,
    pub profile_pic: Option<Option<String>>,
    pub readme: Option<Option<String>>,
    pub timezone: Option<Option<String>>,
    pub metadata: Option<Option<serde_json::Value>>,
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

impl User {

    pub fn create(db: &mut Connection, item: &CreateUser) -> QueryResult<Self> {
        use crate::schema::users::dsl::*;

        insert_into(users).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<Self> {
        use crate::schema::users::dsl::*;

        users.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::users::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = users.count().get_result(db)?;
        let items = users.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: uuid::Uuid, item: &UpdateUser) -> QueryResult<Self> {
        use crate::schema::users::dsl::*;

        diesel::update(users.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<usize> {
        use crate::schema::users::dsl::*;

        diesel::delete(users.filter(id.eq(param_id))).execute(db)
    }

}