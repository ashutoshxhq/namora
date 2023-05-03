use diesel::prelude::*;
use engine_db_repository::{models::teams::{UpdateTeam, Team}, schema::teams::dsl};
use namora_core::types::{db::DbPool, error::Error};
use uuid::Uuid;

#[derive(Clone)]
pub struct TeamService {
    pub pool: DbPool,
}

impl TeamService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn get_team(&self, team_id: Uuid) -> Result<Team, Error> {
        let mut conn = self.pool.clone().get()?;
        let results: Team = dsl::teams.find(team_id).first(&mut conn)?;
        Ok(results)
    }

    pub async fn update_team(&self, team_id: Uuid, data: UpdateTeam) -> Result<Team, Error> {
        let mut conn = self.pool.clone().get()?;
        let team: Team = diesel::update(dsl::teams.find(team_id))
            .set(&data)
            .get_result::<Team>(&mut conn)?;
        Ok(team)
    }

    pub async fn delete_team(&self, team_id: Uuid) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        diesel::delete(dsl::teams.find(team_id)).execute(&mut conn)?;
        Ok(())
    }
}
