use crate::{error::Error, state::DbPool};

use super::dto::MessageWithConversationContext;
use diesel::{
    r2d2::{ConnectionManager, PooledConnection},
    PgConnection,
};

#[derive(Clone)]
pub struct ChatService {
    pub pool: DbPool,
}

impl ChatService {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub fn _get_conn(&self) -> Result<PooledConnection<ConnectionManager<PgConnection>>, Error> {
        Ok(self.pool.get()?)
    }

    pub async fn chat_openai(
        &self,
        message_with_context: MessageWithConversationContext,
    ) -> Result<MessageWithConversationContext, Error> {
        Ok(message_with_context)
    }

    pub async fn chat_system(
        &self,
        message_with_context: MessageWithConversationContext,
    ) -> Result<MessageWithConversationContext, Error> {
        Ok(message_with_context)
    }
}
