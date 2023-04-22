use diesel::{
    r2d2::{ConnectionManager, Pool},
    PgConnection,
};
use uuid::Uuid;

use super::model::{NewReviewArtifact, ReviewArtifact, UpdateReviewArtifact};
use crate::{
    schema::review_artifacts::{self, dsl as review_artifact_dsl},
    types::error::Error,
};
use diesel::prelude::*;

#[derive(Clone)]
pub struct ReviewArtifactRepository {
    pub pool: Pool<ConnectionManager<PgConnection>>,
}

impl ReviewArtifactRepository {
    pub fn new(pool: Pool<ConnectionManager<PgConnection>>) -> Self {
        Self { pool }
    }

    pub fn get_review_artifact_by_id(
        &self,
        review_artifact_id: Uuid,
    ) -> Result<ReviewArtifact, Error> {
        let mut conn = self.pool.clone().get()?;
        let results: ReviewArtifact = review_artifact_dsl::review_artifacts
            .find(review_artifact_id)
            .first(&mut conn)?;
        Ok(results)
    }

    pub fn get_review_artifacts(
        &self,
        team_id: Uuid,
        offset: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<ReviewArtifact>, Error> {
        let mut conn = self.pool.clone().get()?;
        let offset = if let Some(offset) = offset { offset } else { 0 };
        let limit = if let Some(limit) = limit { limit } else { 10 };

        let results: Vec<ReviewArtifact> = review_artifact_dsl::review_artifacts
            .filter(review_artifact_dsl::team_id.eq(team_id))
            .offset(offset)
            .limit(limit)
            .load(&mut conn)?;
        Ok(results)
    }
    pub fn create_review_artifact(&self, data: NewReviewArtifact) -> Result<ReviewArtifact, Error> {
        let mut conn = self.pool.clone().get()?;

        let results: ReviewArtifact = diesel::insert_into(review_artifacts::table)
            .values(&data)
            .get_result(&mut conn)?;

        Ok(results)
    }

    pub fn update_review_artifact_by_id(
        &self,
        review_artifact_id: Uuid,
        data: UpdateReviewArtifact,
    ) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;
        let _application_statement =
            diesel::update(review_artifact_dsl::review_artifacts.find(review_artifact_id))
                .set(&data)
                .get_result::<ReviewArtifact>(&mut conn)?;

        Ok(())
    }

    pub fn delete_review_artifact_by_id(&self, review_artifact_id: Uuid) -> Result<(), Error> {
        let mut conn = self.pool.clone().get()?;

        diesel::delete(review_artifact_dsl::review_artifacts.find(review_artifact_id))
            .execute(&mut conn)?;

        Ok(())
    }
}
