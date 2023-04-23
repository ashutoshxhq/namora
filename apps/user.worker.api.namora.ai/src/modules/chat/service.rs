use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use namora_core::types::error::Error;

use super::dto::{Message, MessageWithConversationContext};

#[derive(Clone)]
pub struct ChatService {}

impl ChatService {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn ai_message_handler(
        &self,
        message_with_context: MessageWithConversationContext,
    ) -> Result<MessageWithConversationContext, Error> {
        let client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
        let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
        let ai_system_prompt = if let Some(ai_system_prompt) = message_with_context.ai_system_prompt
        {
            ai_system_prompt
        } else {
            "".to_string()
        };

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
        for message in &message_with_context.messages {
            messages.push(
                ChatCompletionRequestMessageArgs::default()
                    .role(Role::User)
                    .content(serde_json::to_value(message)?.to_string())
                    .build()?,
            );
        }
        

        let request = CreateChatCompletionRequestArgs::default()
            .model("gpt-4")
            .messages(messages)
            .build()?;

        let response = client.chat().create(request).await?;
        tracing::info!("Message recieved from ai {:?}", response.choices[0].message.content);
        let messages: Vec<Message> = serde_json::from_str(&(response.choices[0].message.content))?;

        let mut conversation_context = message_with_context.context;
        for message in &messages {
            conversation_context.history.messages.push(message.clone());
        }
        let context_with_new_message = MessageWithConversationContext {
            ai_system_prompt: None,
            context: conversation_context,
            messages,
        };
        return Ok(context_with_new_message);
    }

    pub async fn system_message_handler(
        &self,
        message_with_context: MessageWithConversationContext,
    ) -> Result<MessageWithConversationContext, Error> {
        Ok(message_with_context)
    }
}
