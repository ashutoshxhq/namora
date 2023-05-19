use std::{collections::HashMap, fs};

use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use handlebars::Handlebars;
use namora_core::types::{
    error::Error,
    message::{Action, Message},
};
use qdrant_client::{
    prelude::{QdrantClient, QdrantClientConfig},
    qdrant::{with_payload_selector::SelectorOptions, SearchPoints, WithPayloadSelector},
};
use serde_json::{json, Value};

use crate::jsonllm::JsonLLM;

pub async fn is_action_execution_plan_required(
    query: String,
    executed_actions: Vec<Action>,
    messages: Vec<Message>,
) -> Result<bool, Error> {
    tracing::info!("Checking if action execution plan is required");

    let prompt = fs::read_to_string("./public/prompts/is_action_execution_plan_required.txt")?;
    let reg = Handlebars::new();
    let executed_actions = executed_actions
        .iter()
        .map(|action| {
            let action_output = format!("{:?}", action.clone().acion_result.unwrap_or(json!({})));
            json!({
                "action_id": action.id,
                "action_output": format!("{:?}", action_output)
            })
        })
        .collect::<Vec<Value>>();

    let prompt_with_data = reg.render_template(
        &prompt,
        &json!({
            "query": query,
            "executed_actions": format!("{:?}", executed_actions)
        }),
    )?;

    let json_schema = serde_json::from_str(&fs::read_to_string(
        "./public/schemas/is_action_execution_plan_required_response.txt",
    )?)?;

    tracing::info!("Prompt with schema created");

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await.unwrap();
    let is_action_execution_plan_required = jsonllm_result.get("is_action_execution_plan_required");
    if let Some(is_action_execution_plan_required) = is_action_execution_plan_required {
        match is_action_execution_plan_required.as_bool() {
            Some(is_action_execution_plan_required) => {
                tracing::info!(
                    "Action execution plan required: {}",
                    is_action_execution_plan_required
                );
                return Ok(is_action_execution_plan_required);
            }
            None => {
                return Err(Error::from(
                    "Serialization to bool failes, Unable to determine if more context is required",
                ));
            }
        }
    } else {
        return Err(Error::from(
            "Unable to determine if more context is required",
        ));
    }
}

pub async fn create_non_deterministic_plan(
    query: String,
    messages: Vec<Message>,
    identified_actions: Vec<Action>,
) -> Result<String, Error> {
    tracing::info!("Creating non deterministic plan");
    let actions = identified_actions
        .iter()
        .map(|action| {
            json!({
                "action_id": action.id,
                "action_name": action.name,
            })
        })
        .collect::<Vec<Value>>();
    let prompt = fs::read_to_string("./public/prompts/create_non_deterministic_plan.txt")?;
    let reg = Handlebars::new();
    let prompt_with_data = reg.render_template(
        &prompt,
        &json!({ "query": query, "identified_actions": format!("{:?}", actions) }),
    )?;

    let json_schema = serde_json::from_str(&fs::read_to_string(
        "./public/schemas/create_non_deterministic_plan_response.txt",
    )?)?;
    tracing::info!("Prompt with schema created");

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await?;

    tracing::info!("Non deterministic plan generated");

    let plan: Option<&Value> = jsonllm_result.get("plan");

    if let Some(plan) = plan {
        let plan: Vec<String> = serde_json::from_value(plan.clone())?;
        let plan_string = plan.join(", ");
        return Ok(plan_string.to_string());
    } else {
        return Err(Error::from("Unable to create a plan"));
    }
}

pub async fn identify_actions(
    non_deterministic_plan: String,
    top_k: u64,
) -> Result<Vec<Action>, Error> {
    tracing::info!("Identifying actions");
    let mut actions: Vec<Action> = Vec::new();

    let client = Client::new();
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-ada-002")
        .input(non_deterministic_plan)
        .build()?;

    let response = client.embeddings().create(request).await?;
    tracing::info!("recieved openai embeddings response");

    let embedding = response.data[0].embedding.clone();

    let config = QdrantClientConfig::from_url("http://qdrant-vector-db:6334");
    let client = QdrantClient::new(Some(config)).await?;

    let search_result = client
        .search_points(&SearchPoints {
            collection_name: "actions".to_string(),
            vector: embedding,
            filter: None,
            limit: top_k,
            with_vectors: None,
            with_payload: Some(WithPayloadSelector {
                selector_options: Some(SelectorOptions::Enable(true)),
            }),
            params: None,
            score_threshold: None,
            offset: None,
            ..Default::default()
        })
        .await?;

    tracing::info!("recieved qdrant response");

    for point in &search_result.result {
        let action: Action = serde_json::from_value(serde_json::to_value(point.payload.clone())?)?;
        actions.push(action);
    }
    tracing::info!("serialised actions");

    Ok(actions)
}

pub async fn create_deterministic_plan(
    query: String,
    non_deterministic_plan: String,
    identified_actions: Vec<Action>,
    messages: Vec<Message>,
) -> Result<HashMap<u32, Action>, Error> {
    tracing::info!("Creating deterministic plan");

    let prompt = fs::read_to_string("./public/prompts/create_deterministic_plan.txt")?;
    let reg = Handlebars::new();
    let actions = identified_actions
        .iter()
        .map(|action| {
            json!({
                "action_id": action.id,
                "action_name": action.name,
            })
        })
        .collect::<Vec<Value>>();

    let prompt_with_data = reg.render_template(
        &prompt,
        &json!({
            "query": query,
            "identified_actions": format!("{:?}", actions),
            "plan": non_deterministic_plan
        }),
    )?;
    tracing::info!("Prompt with data created");

    let json_schema = serde_json::from_str(&fs::read_to_string(
        "./public/schemas/create_deterministic_plan_response.txt",
    )?)?;

    tracing::info!("Prompt with schema created");
    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await?;
    tracing::info!("Deterministic plan generated");

    let deterministic_plan = jsonllm_result.get("deterministic_plan");
    if let Some(deterministic_plan) = deterministic_plan {
        let action_plan: HashMap<String, String> =
            serde_json::from_value(deterministic_plan.clone())?;
        let mut deterministic_action_plan: HashMap<u32, Action> = HashMap::new();
        for (id, action_id) in action_plan.iter() {
            for action in &identified_actions {
                if action.id == action_id.clone() {
                    deterministic_action_plan.insert(id.parse::<u32>()?, action.clone());
                }
            }
        }
        tracing::info!("Deterministic action plan deserialised");
        Ok(deterministic_action_plan)
    } else {
        tracing::error!("No deterministic plan found");
        return Err(Error::from("No deterministic plan found"));
    }
}
