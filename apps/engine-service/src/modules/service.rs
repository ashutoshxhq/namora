use namora_core::types::db::DbPool;

use super::{authn::service::AuthNService, team::service::TeamService, user::service::UserService};

#[derive(Clone)]
pub struct NamoraAIService {
    pub authn: AuthNService,
    pub team: TeamService,
    pub user: UserService,
}

impl NamoraAIService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            authn: AuthNService::new(pool.clone()),
            team: TeamService::new(pool.clone()),
            user: UserService::new(pool.clone()),
        }
    }
}
