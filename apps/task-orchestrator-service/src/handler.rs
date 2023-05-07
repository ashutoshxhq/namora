use std::fs;

use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use handlebars::Handlebars;
use lapin::{options::BasicPublishOptions, BasicProperties};
use namora_core::types::{
    error::Error,
    message::{
        Action, AdditionalInfo, ExecuteActionInputAdditionalInfo, Message, MessageWithContext,
        NonDeterministicPlanAdditionalInfo,
    },
    worker::WorkerContext,
};
use serde_json::json;

use crate::{
    actions,
    plan::{create_deterministic_plan, find_actions_for_plan, initial_query_handler},
};

pub async fn message_router(
    worker_context: WorkerContext,
    message_with_context: MessageWithContext,
) -> Result<(), Error> {
    tracing::info!("Recieved Message: {:?}", message_with_context);
    let response_message_with_contexts =
        match message_with_context.message.additional_info.step.as_str() {
            "system:basic_response_or_create_plan" => {
                basic_response_or_create_plan(message_with_context).await?
            }
            "system:execute_action" => execute_action(message_with_context).await?,
            "system:generate_response" => generate_response(message_with_context).await?,
            _ => basic_response_or_create_plan(message_with_context).await?,
        };

    for response_message_with_context in response_message_with_contexts {
        if response_message_with_context.message.to == "system" {
            let _ = worker_context
                .channel
                .basic_publish(
                    "",
                    "namora.svc.task-orchestrator",
                    BasicPublishOptions::default(),
                    &serde_json::to_vec(&response_message_with_context)?,
                    BasicProperties::default(),
                )
                .await?;
        } else if response_message_with_context.message.to == "user" {
            let _ = worker_context
                .channel
                .basic_publish(
                    "",
                    &format!(
                        "namora.user.{}",
                        response_message_with_context.context.user_id.unwrap()
                    ),
                    BasicPublishOptions::default(),
                    &serde_json::to_vec(&response_message_with_context).unwrap(),
                    BasicProperties::default(),
                )
                .await?;
        }
    }
    Ok(())
}

pub async fn basic_response_or_create_plan(
    message_with_context: MessageWithContext,
) -> Result<Vec<MessageWithContext>, Error> {
    tracing::info!(
        "User Query Handler Recieved Message: {:?}",
        message_with_context
    );
    let ai_message = initial_query_handler(message_with_context.message.clone()).await?;
    if ai_message.to == "user" {
        let mut response_message_with_context = MessageWithContext {
            message: ai_message.clone(),
            context: message_with_context.context,
        };
        response_message_with_context
            .context
            .execution_context
            .user_query = Some(response_message_with_context.message.content.clone());
        response_message_with_context
            .context
            .messages
            .push(ai_message);
        return Ok(vec![response_message_with_context]);
    }

    if let Some(data) = ai_message.additional_info.data {
        let data: NonDeterministicPlanAdditionalInfo = serde_json::from_value(data)?;

        let actions = find_actions_for_plan(data.plan.clone()).await?;

        let deterministic_plan = create_deterministic_plan(
            message_with_context.message.content.clone(),
            data.plan.clone(),
            actions,
            message_with_context
                .context
                .execution_context
                .executed_actions
                .clone(),
        )
        .await?;
        tracing::info!("Deterministic Plan: {:?}", deterministic_plan);
        let response_message = Message {
            from: "ai".to_string(),
            to: "system".to_string(),
            reply_to: None,
            content: "".to_string(),
            additional_info: AdditionalInfo {
                step: "system:execute_action".to_string(),
                data: Some(serde_json::to_value(deterministic_plan.get(&0))?),
            },
            created_at: Some(chrono::Utc::now()),
        };
        let mut response_message_with_context = message_with_context.clone();

        response_message_with_context.message = response_message.clone();

        response_message_with_context
            .context
            .messages
            .push(response_message);

        response_message_with_context
            .context
            .execution_context
            .deterministic_plan = Some(deterministic_plan);

        response_message_with_context
            .context
            .execution_context
            .non_deterministic_plan = Some(data.plan.clone());

        response_message_with_context
            .context
            .execution_context
            .user_query = Some(message_with_context.message.content.clone());

        // TODO: Create a job in database
        // TODO: Send a message to the user to wait for the response
        // TODO: Create logs for the job/task

        Ok(vec![response_message_with_context])
    } else {
        Err(Error::from("No data in additional info in AI response"))
    }
}

pub async fn execute_action(
    message_with_context: MessageWithContext,
) -> Result<Vec<MessageWithContext>, Error> {
    tracing::info!(
        "Execute Action Handler Recieved Message: {:?}",
        message_with_context
    );
    if let Some(data) = message_with_context.message.additional_info.data.clone() {
        let action_to_execute = serde_json::from_value::<Action>(data)?;

        let system_message = fs::read_to_string("./prompts/system/extract_action_input.txt")?;
        let reg = Handlebars::new();
        let system_message_with_data = reg.render_template(
            &system_message,
            &json!({
                "query": message_with_context.context.execution_context.user_query,
                "plan": message_with_context.context.execution_context.non_deterministic_plan,
                "executed_actions": serde_json::to_value(message_with_context.context.execution_context.executed_actions.clone()).unwrap().to_string(),
                "action": {
                    "action_id": action_to_execute.id,
                    "action_name": action_to_execute.name,
                    "action_input_format": action_to_execute.input_format,
                },
            }),
        )?;

        let client: Client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
        let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
        messages.push(
            ChatCompletionRequestMessageArgs::default()
                .role(Role::System)
                .content(system_message_with_data)
                .build()?,
        );
        messages.push(
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content("generate action input based on the given data")
                .build()?,
        );
        let request = CreateChatCompletionRequestArgs::default()
            .model("gpt-4")
            .messages(messages)
            .build()?;

        let response = client.chat().create(request).await?;

        tracing::info!(
            "Message recieved from ai {:?}",
            response.choices[0].message.content
        );

        let message: Message = serde_json::from_str(&(response.choices[0].message.content))?;

        if let Some(data) = message.additional_info.data.clone() {
            let action_data = serde_json::from_value::<ExecuteActionInputAdditionalInfo>(data)?;
            tracing::info!("Executing action: {:?}", action_to_execute);
            let action_result =
                actions::router::route(message_with_context.context.clone(), action_to_execute.id.clone(), action_data.action_input)
                    .await?;
            tracing::info!("Action result: {:?}", action_result);

            let mut next_action = None;

            if let Some(deterministic_plan) = message_with_context
                .context
                .execution_context
                .deterministic_plan
                .clone()
            {
                let mut next_action_index = None;
                for (index, action) in deterministic_plan.iter() {
                    if action.id == action_to_execute.id {
                        next_action_index = Some(index + 1);
                        break;
                    }
                }
                if let Some(index) = next_action_index {
                    if let Some(action) = deterministic_plan.get(&index) {
                        next_action = Some(action.clone());
                    }
                }
            }

            if let Some(action) = next_action {
                let mut message_with_context = message_with_context.clone();
                let mut current_action = action_to_execute;
                current_action.acion_result = Some(action_result.clone());
                message_with_context.context.execution_context.executed_actions.push(current_action);
                message_with_context.message = Message {
                    from: "system".to_string(),
                    to: "system".to_string(),
                    reply_to: None,
                    content: "".to_string(),
                    additional_info: AdditionalInfo {
                        step: "system:execute_action".to_string(),
                        data: Some(serde_json::to_value(action)?),
                    },
                    created_at: Some(chrono::Utc::now()),
                };
                return Ok(vec![message_with_context]);
            } else {
                let mut message_with_context = message_with_context.clone();
                let mut current_action = action_to_execute;
                current_action.acion_result = Some(action_result.clone());
                message_with_context.context.execution_context.executed_actions.push(current_action);
                message_with_context.message = Message {
                    from: "system".to_string(),
                    to: "system".to_string(),
                    reply_to: None,
                    content: "".to_string(),
                    additional_info: AdditionalInfo {
                        step: "system:generate_response".to_string(),
                        data: None,
                    },
                    created_at: Some(chrono::Utc::now()),
                };
                return Ok(vec![message_with_context]);
            }

            // TODO: Update job in database
            // TODO: Create logs for the job/task
        } else {
            return Err(Error::from("No data in additional info in AI response"));
        }
    } else {
        return Err(Error::from("No data in additional info in AI response"));
    }
}

pub async fn generate_response(
    message_with_context: MessageWithContext,
) -> Result<Vec<MessageWithContext>, Error> {
    tracing::info!(
        "User Response Handler Recieved Message: {:?}",
        message_with_context
    );
    let system_message = fs::read_to_string("./prompts/system/generate_response.txt")?;
    let reg = Handlebars::new();
    let executed_action_outputs = message_with_context.context.execution_context.executed_actions.iter().map(|action| {
        json!({
            "action_id": action.name.clone(),
            "action_output": serde_json::to_value(action.acion_result.clone().unwrap()).unwrap().to_string(),
        })
    }).collect::<Vec<serde_json::Value>>();
    let system_message_with_data = reg.render_template(
        &system_message,
        &json!({
            "query": message_with_context.context.execution_context.user_query,
            "plan": message_with_context.context.execution_context.deterministic_plan,
            "executed_actions": serde_json::to_value(executed_action_outputs.clone()).unwrap().to_string(),
        }),
    )?;

    let client: Client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
    let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::System)
            .content(system_message_with_data)
            .build()?,
    );
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::User)
            .content("generate a final response for user based on the given data")
            .build()?,
    );
    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-4")
        .messages(messages)
        .build()?;

    let response = client.chat().create(request).await?;

    tracing::info!(
        "Message recieved from ai {:?}",
        response.choices[0].message.content
    );

    let message: Message = serde_json::from_str(&(response.choices[0].message.content))?;

    let mut message_with_context = message_with_context.clone();
    message_with_context.message = message.clone();
    message_with_context.context.messages.push(message.clone());
    
    // TODO: Update job in database
    // TODO: Create logs for the job/task

    return Ok(vec![message_with_context]);
}
