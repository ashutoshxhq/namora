use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use namora_core::{
    connector::{send_message_to_system, send_message_to_user},
    types::{
        error::Error,
        message::{AdditionalData, Message, MessageWithConversationContext},
        worker::WorkerContext,
    },
};

pub async fn message_handler(worker_context: WorkerContext, message_with_context: MessageWithConversationContext) -> Result<(), Error> {
    tracing::info!("Recieved Message: {:?}", message_with_context);

    let client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
    let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
    let ai_system_prompt = if let Some(ai_system_prompt) = message_with_context.ai_system_prompt {
        ai_system_prompt
    } else {
        "".to_string()
    };
    tracing::info!("ai_system_prompt: {:?}", ai_system_prompt);
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::System)
            .content(ai_system_prompt)
            .build()?,
    );
    let mut step = String::new();
    for message in &message_with_context.messages {
        if let Some(step_str) = message.step.clone() {
            step = step_str;
        }
    }
    let mut is_user_feedback_res = false;
    for message in message_with_context.messages.clone() {
        if let Some(additional_data) = message.additional_data {
            let additional_data: AdditionalData = serde_json::from_value(additional_data)?;
            if additional_data.action == "user_feedback_response".to_string() {
                is_user_feedback_res = true;
            }
        }
    }

    if is_user_feedback_res {
        tracing::info!("is_user_feedback_res: {:?}", is_user_feedback_res);
        for message in &message_with_context.context.current_query_context.messages {
            tracing::info!("message: {:?}", message);
            if let Some(message_step) = message.step.clone() {
                tracing::info!("message_step: {:?}", message_step);
                if message_step == step {
                    tracing::info!("message.message_from: {:?}", message.message_from);
                    if message.message_from == "AI".to_string() {
                        messages.push(
                            ChatCompletionRequestMessageArgs::default()
                                .role(Role::Assistant)
                                .content(serde_json::to_value(message)?.to_string())
                                .build()?,
                        );
                    } else {
                        messages.push(
                            ChatCompletionRequestMessageArgs::default()
                                .role(Role::User)
                                .content(serde_json::to_value(message)?.to_string())
                                .build()?,
                        );
                    }
                }
            }
        }
    } else {
        tracing::info!("is_user_feedback_res: {:?}", is_user_feedback_res);
        ChatCompletionRequestMessageArgs::default()
            .role(Role::User)
            .content(serde_json::to_value(message_with_context.messages)?.to_string())
            .build()?;
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
            if let Some(user_id) = context_with_response_message.context.user_id {
                tracing::info!("sending message to user: {:?}", user_id);
                send_message_to_user(
                    worker_context.channel.clone(),
                    user_id,
                    serde_json::to_value(context_with_response_message)?,
                )
                .await?;
            } else {
                tracing::error!("No user_id found in message context")
            }
        } else if message.message_to == "SYSTEM" {
            let context_with_response_message = MessageWithConversationContext {
                ai_system_prompt: None,
                context,
                messages: vec![message.clone()],
            };
            tracing::info!("sending message to system");
            send_message_to_system(
                worker_context.channel,
                serde_json::to_value(context_with_response_message)?,
            )
            .await?;
        }
    }
    Ok(())
}
