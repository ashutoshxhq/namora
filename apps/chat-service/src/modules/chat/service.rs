use crate::{error::Error};

use super::dto::MessageWithConversationContext;

#[derive(Clone)]
pub struct ChatService {
}

impl ChatService {
    pub fn new() -> Self {
        Self {}
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
