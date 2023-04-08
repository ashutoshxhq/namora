use super::model::{UpdateTeam, Team};
use crate::{
    error::Error,
    schema::teams::{dsl::teams},
    state::DbPool,
};
use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, PooledConnection},
};
use uuid::Uuid;

#[derive(Clone)]
pub struct TeamService {
    pub pool: DbPool,
}

impl TeamService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub fn get_conn(&self) -> Result<PooledConnection<ConnectionManager<PgConnection>>, Error> {
        Ok(self.pool.get()?)
    }

    pub async fn get_team(&self, team_id: Uuid) -> Result<Team, Error> {
        let results: Team = teams.find(team_id).first(&mut self.get_conn()?)?;
        Ok(results)
    }

    pub async fn update_team(&self, team_id: Uuid, data: UpdateTeam) -> Result<Team, Error> {
        let team = diesel::update(teams.find(team_id))
            .set(&data)
            .get_result::<Team>(&mut self.get_conn()?)?;

        Ok(team)
    }

    pub async fn delete_team(&self, team_id: Uuid) -> Result<(), Error> {
        diesel::delete(teams.find(team_id)).execute(&mut self.get_conn()?)?;
        Ok(())
    }
}
