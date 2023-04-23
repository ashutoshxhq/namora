use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use namora_core::{
    connector::{send_message_to_user, send_message_to_ai},
    types::{
        error::Error,
        message::{Message, MessageWithConversationContext},
        worker::WorkerContext,
    },
};

pub async fn message_handler(worker_context: WorkerContext, msg: String) -> Result<(), Error> {
    let message_with_context: MessageWithConversationContext = serde_json::from_str(&msg)?;

    let client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
    let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
    let ai_system_prompt = if let Some(ai_system_prompt) = message_with_context.ai_system_prompt {
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
        conversation_context
            .current_query_context
            .messages
            .push(message.clone());
    }

    for message in &messages {
        let context = conversation_context.clone();
        let worker_context = worker_context.clone();

        if message.message_to == "USER" {
            let context_with_response_message = MessageWithConversationContext {
                ai_system_prompt: None,
                context,
                messages: vec![message.clone()],
            };
            
            send_message_to_user(
                worker_context,
                context_with_response_message.context.user_id.unwrap(),
                serde_json::to_value(context_with_response_message)?,
            )
            .await?;
        } else if message.message_to == "SYSTEM" {
            let context_with_response_message = MessageWithConversationContext {
                ai_system_prompt: None,
                context,
                messages: vec![message.clone()],
            };

            send_message_to_ai(
                worker_context,
                serde_json::to_value(context_with_response_message)?,
            )
            .await?;
        }
    }

    tracing::info!("Recieved Message: {:?}", msg);
    Ok(())
}
