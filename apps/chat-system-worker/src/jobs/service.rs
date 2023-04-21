use super::model::{NewJob, Job};
use crate::{db::DbPool, schema::jobs, types::Error};
use diesel::prelude::*;

pub async fn create_job(db_pool: DbPool, data: NewJob) -> Result<Job, Error> {
    let mut conn = db_pool.get()?;

    let created_job: Job = diesel::insert_into(jobs::table)
        .values(&data)
        .get_result(&mut conn)?;

    Ok(created_job)
}
