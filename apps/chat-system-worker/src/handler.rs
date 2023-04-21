use std::{env, fs};

use crate::{
    actions::{
        crm::{
            create_object_record_in_crm, get_object_record_from_crm_with_filter,
            update_object_record_in_crm_by_id,
        },
        linkedin::get_linkedin_profile,
    },
    types::{
        Action, AdditionalData, Error, ExecuteActionAdditionalData,
        ExecuteActionPlanAdditionalData, FindActionsAdditionalData, Message,
        MessageWithConversationContext, PineconeQueryResponse,
    }, db::DbPool, jobs::{model::NewJob, service::create_job},
};
use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use serde_json::{json, Value};

pub async fn message_handler(pool: DbPool, msg: String) -> Result<(), Error> {
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
            match additional_data.action.as_str() {
                "extract_context_from_artifact_store" => {
                    extract_context_from_artifact_store(
                        message_with_context,
                        pool.clone(),
                        additional_data.action_data,
                    )
                    .await?
                }
                "find_actions" => {
                    find_actions(message_with_context, pool.clone(), additional_data.action_data).await?
                }
                "execute_action_plan" => {
                    execute_action_plan(message_with_context, pool.clone(), additional_data.action_data).await?
                }
                "execute_action" => {
                    execute_action(message_with_context, pool.clone(), additional_data.action_data).await?
                }
                _ => {}
            };
        }
    }
    tracing::info!("Recieved Message: {:?}", msg);
    Ok(())
}

pub async fn find_actions(
    ctx: MessageWithConversationContext,
    db_pool: DbPool,
    data: Option<Value>,
) -> Result<(), Error> {
    if let Some(data) = data {
        let data: FindActionsAdditionalData = serde_json::from_value(data)?;
        let client = Client::new();
        let request = CreateEmbeddingRequestArgs::default()
            .model("text-embedding-ada-002")
            .input(data.plan.as_str())
            .build()?;

        let response = client.embeddings().create(request).await?;
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

        let response_data: PineconeQueryResponse = response.json().await?;
        println!("res: {:?}", response_data);

        let mut actions: Vec<Action> = Vec::new();

        for doc in &response_data.matches {
            let action: Action = serde_json::from_value(doc.metadata.clone())?;
            actions.push(action);
        }

        let system_prompt = fs::read_to_string("./src/prompts/create_plan_system.txt")?;
        let query_prompt = fs::read_to_string("./src/prompts/create_plan_query.txt")?;

        let ai_message = Message {
            message_from: "SYSTEM".to_string(),
            message_to: "AI".to_string(),
            message: query_prompt,
            created_at: None,
            next_message_to: Some("SYSTEM".to_string()),
            additional_data: Some(serde_json::to_value(response_data.matches)?),
        };

        let mut response_context = ctx.context;
        response_context.history.messages.push(ai_message.clone());
        response_context.unfiltered_actions = Some(actions);

        let response_with_context = MessageWithConversationContext {
            messages: vec![ai_message],
            ai_system_prompt: Some(system_prompt),
            context: response_context,
        };
        send_message_to_ai(serde_json::to_value(response_with_context)?).await?;
    } else {
        tracing::error!("No plan found to search actions from")
    }

    Ok(())
}

pub async fn execute_action_plan(
    ctx: MessageWithConversationContext,
    db_pool: DbPool,
    data: Option<Value>,
) -> Result<(), Error> {
    if let Some(data) = data {
        let action_plan: ExecuteActionPlanAdditionalData = serde_json::from_value(data)?;
        let mut user_response =
            "Here is a list of actions that we will execute to answer your query:\n".to_string();
        let mut filtered_actions: Vec<Action> = Vec::new();

        for action_id in action_plan.action_ids {
            if let Some(unfiltered_actions) = &ctx.context.unfiltered_actions {
                for unfiltered_action in unfiltered_actions {
                    if unfiltered_action.action_id == action_id {
                        filtered_actions.push(unfiltered_action.clone());
                        user_response.push_str(&format!("{}\n", unfiltered_action.action_name));
                    }
                }
            }
        }
        let ai_message = Message {
            message_from: "SYSTEM".to_string(),
            message_to: "USER".to_string(),
            message: user_response,
            created_at: None,
            next_message_to: Some("SYSTEM".to_string()),
            additional_data: None,
        };

        let mut response_context = ctx.context;
        response_context.history.messages.push(ai_message.clone());
        response_context.filtered_actions = Some(filtered_actions.clone());

        let response_with_context = MessageWithConversationContext {
            messages: vec![ai_message],
            ai_system_prompt: None,
            context: response_context,
        };
        send_message_to_user(serde_json::to_value(response_with_context.clone())?).await?;

        let _res = create_job(db_pool.clone(), NewJob{
            name: "".to_string(),
            plan: json!({}),
            status: "".to_string(),
            trigger: json!({}),
            user_id: response_with_context.context.user_id.unwrap(),
            team_id: response_with_context.context.team_id.unwrap()
        }).await?;

        execute_action(
            response_with_context,
            db_pool.clone(),
            Some(json!({
                "action_id": filtered_actions[0].action_id,
                "action_input": action_plan.first_action_input
            })),
        )
        .await?;
    } else {
        tracing::error!("No ordered action found")
    }
    Ok(())
}

pub async fn execute_action(
    ctx: MessageWithConversationContext,
    db_pool: DbPool,
    data: Option<Value>,
) -> Result<(), Error> {
    // TODO: MATCH ACTION & TRIGGER HANDLER
    if let Some(data) = data {
        let execute_action_additional_data: ExecuteActionAdditionalData =
            serde_json::from_value(data)?;
        let mut action_to_execute: Option<Action> = None;
        if let Some(filtered_actions) = &ctx.context.filtered_actions {
            for action in filtered_actions {
                if action.action_id == execute_action_additional_data.action_id {
                    action_to_execute = Some(action.clone());
                }
            }
        }

        if let Some(action_to_execute) = action_to_execute {
            let action_result = match action_to_execute.action_id.as_str() {
                "get_linkedin_profile" => {
                    get_linkedin_profile(execute_action_additional_data.action_input).await?
                }
                "get_lead_from_crm_with_filter" => {
                    get_object_record_from_crm_with_filter(
                        "lead".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "create_lead_in_crm" => {
                    create_object_record_in_crm(
                        "lead".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "update_lead_in_crm_by_id" => {
                    update_object_record_in_crm_by_id(
                        "lead".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "get_account_from_crm_with_filter" => {
                    get_object_record_from_crm_with_filter(
                        "account".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "create_account_in_crm" => {
                    create_object_record_in_crm(
                        "account".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "update_account_in_crm_by_id" => {
                    update_object_record_in_crm_by_id(
                        "account".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "get_deal_from_crm_with_filter" => {
                    get_object_record_from_crm_with_filter(
                        "deal".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "create_deal_in_crm" => {
                    create_object_record_in_crm(
                        "deal".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "update_deal_in_crm_by_id" => {
                    update_object_record_in_crm_by_id(
                        "deal".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "get_contact_from_crm_with_filter" => {
                    get_object_record_from_crm_with_filter(
                        "contact".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "create_contact_in_crm" => {
                    create_object_record_in_crm(
                        "contact".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                "update_contact_in_crm_by_id" => {
                    update_object_record_in_crm_by_id(
                        "contact".to_string(),
                        execute_action_additional_data.action_input,
                    )
                    .await?
                }
                _ => {
                    json!({})
                }
            };
        }
    }
    // TODO: EXTRACT RELEVENT DATA FROM OUTPUTS SO FAR
    // TODO: IF MORE ACTION, ASK AI TO GENERATE NEXT ACTION INPUT ELSE GENERATE SUMMARY/ ANSWER FOR USER
    Ok(())
}

pub async fn extract_context_from_artifact_store(
    ctx: MessageWithConversationContext,
    db_pool: DbPool,
    data: Option<Value>,
) -> Result<(), Error> {
    Ok(())
}

pub async fn send_message_to_user(data: Value) -> Result<(), Error> {
    // let region_provider =
    //     RegionProviderChain::first_try(aws_types::region::Region::new("us-west-2"));
    // let shared_config = aws_config::from_env().region(region_provider).load().await;

    // let client = aws_sdk_sns::Client::new(&shared_config);
    // client.subscribe().set_attributes(Some(

    // ))

    // let client = aws_sdk_sqs::Client::new(&shared_config);
    // let queue_url = std::env::var("CHAT_USER_SQS_URL").expect("CHAT_USER_SQS_URL must be set");

    // let rsp = client
    //     .send_message()
    //     .queue_url(queue_url)
    //     .message_body(&data.to_string())
    //     .send()
    //     .await?;

    tracing::info!("Sent message to user, Response:");

    Ok(())
}

pub async fn send_message_to_ai(data: Value) -> Result<(), Error> {
    // let region_provider =
    //     RegionProviderChain::first_try(aws_types::region::Region::new("us-west-2"));
    // let shared_config = aws_config::from_env().region(region_provider).load().await;
    // let client = aws_sdk_sqs::Client::new(&shared_config);
    // let queue_url = std::env::var("CHAT_AI_SQS_URL").expect("CHAT_AI_SQS_URL must be set");

    // let rsp = client
    //     .send_message()
    //     .queue_url(queue_url)
    //     .message_body(&data.to_string())
    //     .send()
    //     .await?;

    tracing::info!("Sent message to user, Response:");

    Ok(())
}
