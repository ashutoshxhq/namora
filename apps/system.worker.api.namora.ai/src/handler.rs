use std::{env, fs};

use crate::{actions, types::pinecone::PineconeQueryResponse};
use agent_db_repository::jobs::{model::NewJob, repository::JobRepository};
use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use handlebars::Handlebars;
use namora_core::{
    connector::{send_message_to_ai, send_message_to_user},
    types::{
        error::{Error, ErrorBuilder},
        message::{
            Action, AdditionalData, ExecuteActionAdditionalData, ExecuteActionPlanAdditionalData,
            FindActionsAdditionalData, Message, MessageWithConversationContext,
        },
        worker::WorkerContext,
    },
};
use serde_json::{json, Value};

pub async fn message_handler(worker_context: WorkerContext, msg: String) -> Result<(), Error> {
    tracing::info!("Recieved Message: {:?}", msg);
    let message_with_context: MessageWithConversationContext = serde_json::from_str(&msg)?;
    let mut message: Option<Message> = None;

    for msg in &message_with_context.messages {
        if msg.message_to == "SYSTEM" {
            message = Some(msg.clone())
        }
    }

    if let Some(message) = message {
        if let Some(additional_data) = message.additional_data {
            let additional_data: AdditionalData = serde_json::from_value(additional_data)?;
            tracing::info!("Matched Action: {:?}", additional_data.action);
            match additional_data.action.as_str() {
                "create_non_deterministic_plan" => {
                    create_non_deterministic_plan(
                        worker_context.clone(),
                        message_with_context,
                        additional_data.action_data,
                    )
                    .await?
                }
                "find_actions" => {
                    find_actions(
                        worker_context.clone(),
                        message_with_context,
                        additional_data.action_data,
                    )
                    .await?
                }
                "create_deterministic_plan" => {
                    create_deterministic_plan(
                        worker_context.clone(),
                        message_with_context,
                        additional_data.action_data,
                    )
                    .await?
                }
                "execute_action" => {
                    execute_action(
                        worker_context.clone(),
                        message_with_context,
                        additional_data.action_data,
                    )
                    .await?
                }
                _ => {
                    create_non_deterministic_plan(
                        worker_context.clone(),
                        message_with_context,
                        additional_data.action_data,
                    )
                    .await?
                }
            };
        }
    }
    tracing::info!("Recieved Message: {:?}", msg);
    Ok(())
}

pub async fn find_actions(
    worker_context: WorkerContext,
    message_context: MessageWithConversationContext,
    data: Option<Value>,
) -> Result<(), Error> {
    tracing::info!("find_actions triggered");
    if let Some(data) = data {
        let data: FindActionsAdditionalData = serde_json::from_value(data)?;
        let client = Client::new();
        let request = CreateEmbeddingRequestArgs::default()
            .model("text-embedding-ada-002")
            .input(data.plan.as_str())
            .build()?;

        let response = client.embeddings().create(request).await?;
        tracing::info!("recieved openai embeddings response: {:?}", response);
        let embeddings = response.data[0].embedding.clone();

        let client = reqwest::Client::new();
        let pinecone_api_key = env::var("PINECONE_API_KEY")?;

        let response = client
            .post("https://cadenceiq-action-intents-56068f7.svc.us-east1-gcp.pinecone.io/query")
            .json(&json!({
                "vector": embeddings,
                "topK": 5,
                "includeMetadata": true,
                "includeValues": false,
                "namespace": "intents",
            }))
            .header("Api-Key", pinecone_api_key)
            .send()
            .await?;
        tracing::info!("recieved pinecone response: {:?}", response);

        let response_data: PineconeQueryResponse = response.json().await?;
        println!("res: {:?}", response_data);

        let mut actions: Vec<Action> = Vec::new();

        for doc in &response_data.matches {
            let action: Action = serde_json::from_value(doc.metadata.clone())?;
            actions.push(action);
        }
        let mut response_context = message_context.context;

        let system_prompt =
            fs::read_to_string("./src/prompts/system/create_deterministic_plan.txt")?;
        let query_prompt = fs::read_to_string("./src/prompts/query/create_deterministic_plan.txt")?;
        let reg = Handlebars::new();
        if let Some(plan) = response_context.current_query_context.clone().plan {
            let system = reg.render_template(
                &system_prompt,
                &json!({
                    "query": response_context.current_query_context.clone().query.clone(),
                    "plan": plan,
                    "actions": response_context.current_query_context.clone().unfiltered_actions
                }),
            )?;

            let ai_message = Message {
                message_from: "SYSTEM".to_string(),
                message_to: "AI".to_string(),
                message: query_prompt,
                created_at: None,
                step: Some("create_plan".to_string()),
                next_message_to: Some("SYSTEM".to_string()),
                additional_data: Some(serde_json::to_value(response_data.matches)?),
            };

            response_context
                .current_query_context
                .messages
                .push(ai_message.clone());
            response_context.current_query_context.unfiltered_actions = actions;

            let response_with_context = MessageWithConversationContext {
                messages: vec![ai_message],
                ai_system_prompt: Some(system),
                context: response_context,
            };
            tracing::info!("Sending message to AI: {:?}", response_with_context);
            send_message_to_ai(
                worker_context.clone().channel,
                serde_json::to_value(response_with_context)?,
            )
            .await?;
        } else {
            tracing::error!("No plan found to search actions from")
        }
    } else {
        tracing::error!("No plan found to search actions from")
    }

    Ok(())
}

pub async fn create_deterministic_plan(
    worker_context: WorkerContext,
    message_context: MessageWithConversationContext,
    data: Option<Value>,
) -> Result<(), Error> {
    tracing::info!("create_deterministic_plan triggered");
    if let Some(data) = data {
        let action_plan: ExecuteActionPlanAdditionalData = serde_json::from_value(data)?;
        // To the user not AI, just for feedback
        let mut user_response =
            "Here is a list of actions that we will execute to answer your query:\n".to_string();
        let mut filtered_actions: Vec<Action> = Vec::new();

        for action_id in action_plan.action_ids {
            for unfiltered_action in &message_context
                .context
                .current_query_context
                .unfiltered_actions
            {
                if unfiltered_action.action_id == action_id {
                    filtered_actions.push(unfiltered_action.clone());
                    user_response.push_str(&format!("{}\n", unfiltered_action.action_name));
                }
            }
        }
        let ai_message = Message {
            message_from: "SYSTEM".to_string(),
            message_to: "USER".to_string(),
            message: user_response,
            created_at: None,
            next_message_to: Some("SYSTEM".to_string()),
            step: Some("created_plan".to_string()),
            additional_data: None,
        };

        let mut response_context = message_context.context;
        response_context
            .current_query_context
            .messages
            .push(ai_message.clone());
        response_context.current_query_context.filtered_actions = filtered_actions.clone();

        let response_with_context = MessageWithConversationContext {
            messages: vec![ai_message],
            ai_system_prompt: None,
            context: response_context,
        };
        if let Some(user_id) = response_with_context.context.user_id {
            if let Some(team_id) = response_with_context.context.team_id {
                tracing::info!("Sending message to user: {:?}", response_with_context);
                send_message_to_user(
                    worker_context.clone(),
                    user_id,
                    serde_json::to_value(response_with_context.clone())?,
                )
                .await?;

                let jobs_repo = JobRepository::new(worker_context.pool.clone());
                let _res = jobs_repo.create_job(NewJob {
                    name: "".to_string(),
                    plan: json!({}),
                    status: "".to_string(),
                    trigger: json!({}),
                    user_id,
                    team_id,
                });
                tracing::info!(
                    "triggering execute action for action: {:?}",
                    filtered_actions[0]
                );
                execute_action(
                    worker_context.clone(),
                    response_with_context,
                    Some(json!({
                        "action_id": filtered_actions[0].action_id,
                        "action_input": action_plan.first_action_input
                    })),
                )
                .await?;
            } else {
                tracing::error!("No team_id found in message context");
                return Err(ErrorBuilder::new(
                    "INTERNAL_SERVER_ERROR",
                    "No team_id found in message context",
                ));
            }
        } else {
            tracing::error!("No user_id found in message context");
            return Err(ErrorBuilder::new(
                "INTERNAL_SERVER_ERROR",
                "No user_id found in message context",
            ));
        }
    } else {
        tracing::error!("No ordered action found")
    }
    Ok(())
}

pub async fn execute_action(
    worker_context: WorkerContext,
    message_context: MessageWithConversationContext,
    data: Option<Value>,
) -> Result<(), Error> {
    tracing::info!("execute_action triggered");
    if let Some(data) = data {
        let execute_action_additional_data: ExecuteActionAdditionalData =
            serde_json::from_value(data)?;
        let mut action_to_execute: Option<Action> = None;

        for (_index, action) in message_context
            .context
            .current_query_context
            .filtered_actions
            .iter()
            .enumerate()
        {
            if action.action_id == execute_action_additional_data.action_id {
                action_to_execute = Some(action.clone());
            }
        }

        if let Some(action_to_execute) = action_to_execute {
            tracing::info!("Executing action: {:?}", action_to_execute);
            let action_result = actions::router::route(
                action_to_execute.action_id.clone(),
                execute_action_additional_data.action_input,
            )
            .await?;
            tracing::info!("Action result: {:?}", action_result);
            let mut response_context = message_context.context;
            let mut executed_action = action_to_execute.clone();
            executed_action.acion_result = Some(serde_json::to_value(action_result)?);

            response_context
                .current_query_context
                .executed_actions
                .push(executed_action);

            for (index, action) in response_context
                .current_query_context
                .filtered_actions
                .clone()
                .iter()
                .enumerate()
            {
                if action.action_id == action_to_execute.action_id {
                    response_context
                        .current_query_context
                        .filtered_actions
                        .remove(index);
                }
            }
            tracing::info!(
                "Filtered actions: {:?}",
                response_context.current_query_context.filtered_actions
            );
            // TODO: EXTRACT RELEVENT DATA FROM OUTPUTS SO FAR

            if let Some(next_action) = response_context
                .current_query_context
                .filtered_actions
                .first()
            {
                let system_prompt =
                    fs::read_to_string("./src/prompts/system/extract_action_input.txt")?;
                let query_prompt =
                    fs::read_to_string("./src/prompts/query/extract_action_input.txt")?;
                if let Some(plan) = response_context.current_query_context.clone().plan {
                    let reg = Handlebars::new();
                    let query = reg.render_template(&query_prompt, &response_context)?;
                    let system = reg.render_template(&system_prompt, &json!({
                        "query": response_context.current_query_context.clone().query.clone(),
                        "plan": plan,
                        "action": next_action.clone(),
                        "executed_actions": response_context.current_query_context.clone().executed_actions
                    }))?;

                    let ai_message = Message {
                        additional_data: None,
                        created_at: None,
                        message: query,
                        message_from: "SYSTEM".to_string(),
                        message_to: "AI".to_string(),
                        next_message_to: Some("SYSTEM".to_string()),
                        step: Some(format!(
                            "extract_action_input_{}",
                            action_to_execute.action_id
                        )),
                    };
                    response_context
                        .current_query_context
                        .messages
                        .push(ai_message.clone());

                    let response_with_context = MessageWithConversationContext {
                        messages: vec![ai_message],
                        ai_system_prompt: Some(system),
                        context: response_context,
                    };

                    tracing::info!("Sending message to AI: {:?}", response_with_context);
                    send_message_to_ai(
                        worker_context.channel,
                        serde_json::to_value(response_with_context)?,
                    )
                    .await?;
                    return Ok(());
                } else {
                    tracing::error!("Unable to extract plan from context");
                }
            } else {
                //TODO: When no action is left generate final user summary
                tracing::info!("No action left to execute, so generating final response");
                let system_prompt =
                    fs::read_to_string("./src/prompts/system/generate_final_response.txt")?;
                let query_prompt =
                    fs::read_to_string("./src/prompts/query/generate_final_response.txt")?;
                if let Some(plan) = response_context.current_query_context.clone().plan {
                    let reg = Handlebars::new();
                    let query = reg.render_template(&query_prompt, &response_context)?;
                    let system = reg.render_template(&system_prompt, &json!({
                    "query": response_context.current_query_context.clone().query.clone(),
                    "plan": plan,
                    "executed_actions": response_context.current_query_context.clone().executed_actions
                }))?;

                    let ai_message = Message {
                        additional_data: None,
                        created_at: None,
                        message: query,
                        message_from: "SYSTEM".to_string(),
                        message_to: "AI".to_string(),
                        next_message_to: Some("USER".to_string()),
                        step: Some("generate_final_response".to_string()),
                    };

                    response_context
                        .current_query_context
                        .messages
                        .push(ai_message.clone());

                    let response_with_context = MessageWithConversationContext {
                        messages: vec![ai_message],
                        ai_system_prompt: Some(system),
                        context: response_context,
                    };
                    tracing::info!("Sending message to AI: {:?}", response_with_context);

                    send_message_to_ai(
                        worker_context.channel,
                        serde_json::to_value(response_with_context)?,
                    )
                    .await?;
                    return Ok(());
                } else {
                    tracing::error!("Unable to extract plan from context");
                }
            }
        }
    }

    Err(ErrorBuilder::new(
        "BAD_REQUEST",
        "Something went wrong parsing the data",
    ))
}

pub async fn create_non_deterministic_plan(
    worker_context: WorkerContext,
    message_context: MessageWithConversationContext,
    data: Option<Value>,
) -> Result<(), Error> {
    tracing::info!("Creating non deterministic plan");
    // TODO: Extract context from artifact store

    let system_prompt =
        fs::read_to_string("./src/prompts/system/create_non_deterministic_plan.txt")?;
    if let Some(data) = data {
        let data: Message = serde_json::from_value(data)?;

        let reg = Handlebars::new();
        let query = reg.render_template(&data.message, &json!({}))?;
        let ai_message = Message {
            additional_data: None,
            created_at: None,
            message: query,
            message_from: "USER".to_string(),
            message_to: "AI".to_string(),
            next_message_to: Some("SYSTEM".to_string()),
            step: Some("initial_query".to_string()),
        };
        let mut response_context = message_context.context;
        response_context
            .current_query_context
            .messages
            .push(ai_message.clone());

        let response_with_context = MessageWithConversationContext {
            messages: vec![ai_message],
            ai_system_prompt: Some(system_prompt),
            context: response_context,
        };
        tracing::info!("Sending message to AI: {:?}", response_with_context);
        send_message_to_ai(
            worker_context.channel,
            serde_json::to_value(response_with_context)?,
        )
        .await?;

        Ok(())
    } else {
        tracing::error!("Unable to parse message");
        return Err(ErrorBuilder::new(
            "INTERNAL_SERVER_ERROR",
            "Something went wrong parsing message",
        ));
    }
}
