
use namora_core::types::db::DbPool;

use crate::modules::service::NamoraAIService;

#[derive(Clone)]
pub struct NamoraAIState {
    pub pool: DbPool,
    pub services: NamoraAIService,
}

impl NamoraAIState {
    pub fn new(pool: DbPool) -> Self {
        Self {
            pool: pool.clone(),
            services: NamoraAIService::new(pool),
        }
    }
}
