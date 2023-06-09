use namora_core::types::db::DbPool;

use super::{authn::service::AuthNService, team::service::TeamService, user::service::UserService, crm::service::CRMIntegrationService, tasks::service::TaskService, nylas::service::NylasIntegrationService};

#[derive(Clone)]
pub struct NamoraAIService {
    pub authn: AuthNService,
    pub team: TeamService,
    pub user: UserService,
    pub task: TaskService,
    pub crm_integration: CRMIntegrationService,
    pub nylas_integration: NylasIntegrationService,
}

impl NamoraAIService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            authn: AuthNService::new(pool.clone()),
            team: TeamService::new(pool.clone()),
            user: UserService::new(pool.clone()),
            task: TaskService::new(pool.clone()),
            crm_integration: CRMIntegrationService::new(pool.clone()),
            nylas_integration: NylasIntegrationService::new(pool.clone()),
        }
    }
}
