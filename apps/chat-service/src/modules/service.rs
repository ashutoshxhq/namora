use crate::state::DbPool;

use super::{user::service::UserService, authn::service::AuthNService, team::service::TeamService, chat::service::ChatService};

#[derive(Clone)]
pub struct CodeGraphService {
    pub authn: AuthNService,
    pub user: UserService,
    pub team: TeamService,
    pub chat: ChatService,
}

impl CodeGraphService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            authn: AuthNService::new(pool.clone()),
            user: UserService::new(pool.clone()),
            team: TeamService::new(pool.clone()),
            chat: ChatService::new(pool.clone()),
        }
    }
}
