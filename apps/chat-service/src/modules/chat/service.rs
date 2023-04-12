use async_openai::{types::{ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs, Role, CreateChatCompletionRequestArgs}, Client};

use crate::error::{Error, ExecuteAIError};

use super::dto::{MessageWithConversationContext, Message};

#[derive(Clone)]
pub struct ChatService {}

impl ChatService {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn chat_ai(
        &self,
        message_with_context: MessageWithConversationContext,
    ) -> Result<MessageWithConversationContext, Error> {
        let client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
        let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
        if let Some(ai_system_prompt) = message_with_context.ai_system_prompt {
            messages.push(
                ChatCompletionRequestMessageArgs::default()
                    .role(Role::System)
                    .content(ai_system_prompt)
                    .build()?,
            );
            for message in &message_with_context.context.history.messages {
                if message.message_from == "AI" {
                    messages.push(
                        ChatCompletionRequestMessageArgs::default()
                            .role(Role::Assistant)
                            .content(serde_json::to_value(message)?.to_string())
                            .build()?,
                    )
                } else {
                    messages.push(
                        ChatCompletionRequestMessageArgs::default()
                            .role(Role::User)
                            .content(message.message.clone())
                            .build()?,
                    )
                }
            }
            messages.push( ChatCompletionRequestMessageArgs::default()
            .role(Role::User)
            .content(serde_json::to_value(message_with_context.message)?.to_string())
            .build()?);

            let request = CreateChatCompletionRequestArgs::default()
                .model("gpt-4")
                .messages(messages)
                .build()?;

            let response = client.chat().create(request).await?;
            let message: Message = serde_json::from_str(&(response.choices[0].message.content))?;
            let mut conversation_context = message_with_context.context;
            conversation_context.history.messages.push(message.clone());
            let context_with_new_message = MessageWithConversationContext{
                ai_system_prompt: None,
                context: conversation_context,
                message
            };
            return Ok(context_with_new_message);
        }
        Err(ExecuteAIError::new(
            "NO_SYSTEM_PROMPT".to_string(),
            "No system prompt provided in message".to_string(),
            400
        ))
    }

    pub async fn chat_system(
        &self,
        message_with_context: MessageWithConversationContext,
    ) -> Result<MessageWithConversationContext, Error> {
        Ok(message_with_context)
    }
}
