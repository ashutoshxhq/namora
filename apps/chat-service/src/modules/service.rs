use crate::state::DbPool;

use super::chat::service::ChatService;

#[derive(Clone)]
pub struct MetaLoopService {
    pub chat: ChatService,
}

impl MetaLoopService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            chat: ChatService::new(pool.clone()),
        }
    }
}
