use diesel::{r2d2::{Pool, ConnectionManager}, PgConnection};
use uuid::Uuid;

use crate::{types::error::Error, schema::jobs::{dsl as jobs_dsl, self}};
use diesel::prelude::*;
use super::model::{Job, NewJob, UpdateJob};


#[derive(Clone)]
pub struct JobRepository {
    pub pool: Pool<ConnectionManager<PgConnection>>,
}

impl JobRepository {
    pub fn new(pool: Pool<ConnectionManager<PgConnection>>) -> Self {
        Self { pool }
    }

    pub fn get_job_by_id(&self, job_id: Uuid) -> Result<Job, Error> {
        let mut conn = self.pool.clone().get()?;
        let results: Job = jobs_dsl::jobs.find(job_id).first(&mut conn)?;
        Ok(results)
    }

    pub fn get_jobs(
        &self,
        team_id: Uuid,
        offset: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<Job>, Error> {
        let mut conn = self.pool.clone().get()?;
        let offset = if let Some(offset) = offset { offset } else { 0 };
        let limit = if let Some(limit) = limit { limit } else { 10 };

        let results: Vec<Job> = jobs_dsl::jobs
            .filter(jobs_dsl::team_id.eq(team_id))
            .offset(offset)
            .limit(limit)
            .load(&mut conn)?;
        Ok(results)
    }
    pub fn create_job(
        &self,
        data: NewJob,
    ) -> Result<Job, Error> {
        let mut conn = self.pool.clone().get()?;

        let results: Job = diesel::insert_into(jobs::table)
            .values(&data)
            .get_result(&mut conn)?;

        Ok(results)
    }

    pub fn update_job_by_id(
        &self,
        job_id: Uuid,
        data: UpdateJob,
    ) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        let _application_statement = diesel::update(jobs_dsl::jobs.find(job_id))
            .set(&data)
            .get_result::<Job>(&mut conn)?;

        Ok(())
    }

    pub fn delete_job_by_id(&self, job_id: Uuid) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;

        diesel::delete(jobs_dsl::jobs.find(job_id))
            .execute(&mut conn)?;

        Ok(())
    }
}