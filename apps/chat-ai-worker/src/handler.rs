use crate::types::{Error, Message, MessageWithConversationContext};
use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use aws_sdk_sqs::model::Message as SQSMessage;

pub async fn message_handler(message: SQSMessage) -> Result<(), Error> {
    tracing::info!("Recieved Message: {:?}", message);

    if let Some(message) = message.body() {
        let message_with_context: MessageWithConversationContext = serde_json::from_str(message)?;

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
        tracing::info!(
            "Message recieved from ai {:?}",
            response.choices[0].message.content
        );
        let messages: Vec<Message> = serde_json::from_str(&(response.choices[0].message.content))?;

        let mut conversation_context = message_with_context.context;
        for message in &messages {
            conversation_context.history.messages.push(message.clone());
        }
        let _context_with_response_message = MessageWithConversationContext {
            ai_system_prompt: None,
            context: conversation_context,
            messages,
        };
        // TODO: PUSH MESSAGE TO USER OR SYSTEM OR USER
    } else {
        tracing::info!("No message body found");
    }
    Ok(())
}
