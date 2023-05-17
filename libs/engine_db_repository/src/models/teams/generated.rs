/* This file is generated and managed by dsync */

use diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use diesel::r2d2::{PooledConnection, ConnectionManager};
use serde::{Deserialize, Serialize};


type Connection = PooledConnection<ConnectionManager<PgConnection>>;

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Selectable)]
#[diesel(table_name=teams, primary_key(id))]
pub struct Team {
    pub id: uuid::Uuid,
    pub company_name: Option<String>,
    pub company_website: Option<String>,
    pub company_description: Option<String>,
    pub company_email: Option<String>,
    pub company_phone: Option<String>,
    pub company_address: Option<String>,
    pub vessel_connection_id: Option<String>,
    pub vessel_access_token: Option<String>,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    pub plan: Option<String>,
    pub subscription_status: Option<String>,
    pub no_of_seats: Option<i32>,
    pub trial_started_at: Option<chrono::NaiveDateTime>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=teams)]
pub struct CreateTeam {
    pub id: uuid::Uuid,
    pub company_name: Option<String>,
    pub company_website: Option<String>,
    pub company_description: Option<String>,
    pub company_email: Option<String>,
    pub company_phone: Option<String>,
    pub company_address: Option<String>,
    pub vessel_connection_id: Option<String>,
    pub vessel_access_token: Option<String>,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    pub plan: Option<String>,
    pub subscription_status: Option<String>,
    pub no_of_seats: Option<i32>,
    pub trial_started_at: Option<chrono::NaiveDateTime>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=teams)]
pub struct UpdateTeam {
    pub company_name: Option<Option<String>>,
    pub company_website: Option<Option<String>>,
    pub company_description: Option<Option<String>>,
    pub company_email: Option<Option<String>>,
    pub company_phone: Option<Option<String>>,
    pub company_address: Option<Option<String>>,
    pub vessel_connection_id: Option<Option<String>>,
    pub vessel_access_token: Option<Option<String>>,
    pub stripe_customer_id: Option<Option<String>>,
    pub stripe_subscription_id: Option<Option<String>>,
    pub plan: Option<Option<String>>,
    pub subscription_status: Option<Option<String>>,
    pub no_of_seats: Option<Option<i32>>,
    pub trial_started_at: Option<Option<chrono::NaiveDateTime>>,
    pub metadata: Option<Option<serde_json::Value>>,
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

impl Team {

    pub fn create(db: &mut Connection, item: &CreateTeam) -> QueryResult<Self> {
        use crate::schema::teams::dsl::*;

        insert_into(teams).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<Self> {
        use crate::schema::teams::dsl::*;

        teams.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::teams::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = teams.count().get_result(db)?;
        let items = teams.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: uuid::Uuid, item: &UpdateTeam) -> QueryResult<Self> {
        use crate::schema::teams::dsl::*;

        diesel::update(teams.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: uuid::Uuid) -> QueryResult<usize> {
        use crate::schema::teams::dsl::*;

        diesel::delete(teams.filter(id.eq(param_id))).execute(db)
    }

}