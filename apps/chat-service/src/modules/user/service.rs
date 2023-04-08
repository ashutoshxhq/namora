use super::model::{UpdateUser, User, CreateUser};
use crate::{
    error::Error,
    schema::users::{dsl::users, email, firstname, lastname, username},
    state::DbPool,
};
use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, PooledConnection},
};
use uuid::Uuid;

#[derive(Clone)]
pub struct UserService {
    pub pool: DbPool,
}

impl UserService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub fn get_conn(&self) -> Result<PooledConnection<ConnectionManager<PgConnection>>, Error> {
        Ok(self.pool.get()?)
    }

    pub async fn get_user(&self, user_id: Uuid) -> Result<User, Error> {
        let results: User = users.find(user_id).first(&mut self.get_conn()?)?;
        Ok(results)
    }

    pub fn get_users(
        &self,
        query: String,
        offset: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<User>, Error> {
        let offset = if let Some(offset) = offset { offset } else { 0 };
        let limit = if let Some(limit) = limit { limit } else { 10 };

        let results: Vec<User> = users
            .filter(
                username
                    .ilike(format!("%{}%", query.clone()))
                    .or(email.ilike(format!("%{}%", query.clone())))
                    .or(firstname.ilike(format!("%{}%", query.clone())))
                    .or(lastname.ilike(format!("%{}%", query.clone()))),
            )
            .offset(offset)
            .limit(limit)
            .load(&mut self.get_conn()?)?;
        Ok(results)
    }

    pub async fn create_user(&self,data: CreateUser) -> Result<User, Error> {
        let user = diesel::insert_into(users)
            .values(data)
            .get_result::<User>(&mut self.get_conn()?)?;

        Ok(user)
    }

    pub async fn update_user(&self, user_id: Uuid, data: UpdateUser) -> Result<User, Error> {
        let user = diesel::update(users.find(user_id))
            .set(&data)
            .get_result::<User>(&mut self.get_conn()?)?;

        Ok(user)
    }

    pub async fn delete_user(&self, user_id: Uuid) -> Result<(), Error> {
        diesel::delete(users.find(user_id)).execute(&mut self.get_conn()?)?;
        Ok(())
    }
}
