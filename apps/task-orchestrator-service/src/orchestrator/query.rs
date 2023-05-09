use std::{collections::HashMap, env, fs};

use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use handlebars::Handlebars;
use namora_core::types::{
    error::Error,
    message::{Action, Message},
};
use serde_json::{json, Value};

use crate::{jsonllm::JsonLLM, types::pinecone::PineconeQueryResponse};

pub async fn is_more_context_required(
    query: String,
    executed_actions: Vec<Action>,
    messages: Vec<Message>
) -> Result<bool, Error> {
    let prompt = fs::read_to_string("./public/prompts/is_more_context_required.txt")?;
    let reg = Handlebars::new();
    let executed_actions_string = serde_json::to_string(&executed_actions)?;
    let prompt_with_data = reg.render_template(
        &prompt,
        &json!({
            "query": query,
            "executed_actions": executed_actions_string
        }),
    )?;

    let json_schema = serde_json::from_str(&fs::read_to_string(
        "./public/schemas/is_more_context_required_response.txt",
    )?)?;

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await.unwrap();
    let can_answer_without_third_party_app_interaction = jsonllm_result.get("can_answer_without_third_party_app_interaction");
    if let Some(can_answer_without_third_party_app_interaction) = can_answer_without_third_party_app_interaction {
        match can_answer_without_third_party_app_interaction.as_bool() {
            Some(can_answer_without_third_party_app_interaction) => {
                return Ok(can_answer_without_third_party_app_interaction);
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
) -> Result<String, Error> {
    let prompt = fs::read_to_string("./public/prompts/create_non_deterministic_plan.txt")?;
    let reg = Handlebars::new();
    let prompt_with_data = reg.render_template(&prompt, &json!({ "query": query }))?;

    let json_schema = serde_json::to_value(fs::read_to_string(
        "./public/schemas/create_non_deterministic_plan_response.txt",
    )?)?;

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await?;

    let plan = jsonllm_result.get("plan");

    if let Some(plan) = plan {
        return Ok(plan.to_string());
    } else {
        return Err(Error::from("Unable to create a plan"));
    }
}

pub async fn identify_actions(non_deterministic_plan: String) -> Result<Vec<Action>, Error> {
    let mut actions: Vec<Action> = Vec::new();

    let client = Client::new();
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-ada-002")
        .input(non_deterministic_plan)
        .build()?;

    let response = client.embeddings().create(request).await?;
    tracing::info!("recieved openai embeddings response");

    let embedding = response.data[0].embedding.clone();

    let client = reqwest::Client::new();
    let pinecone_api_key = env::var("PINECONE_API_KEY")?;
    let pinecone_index_host = env::var("PINECONE_INDEX_HOST")?;

    let response = client
        .post(format!("https://{}/query", pinecone_index_host))
        .json(&json!({
            "vector": embedding,
            "topK": 5,
            "includeMetadata": true,
            "includeValues": false,
            "namespace": "actions",
        }))
        .header("Api-Key", pinecone_api_key)
        .send()
        .await?;
    tracing::info!("recieved pinecone response");

    let response_data: PineconeQueryResponse = response.json().await?;

    for doc in &response_data.matches {
        tracing::info!("Actions: {:?}", doc.metadata);
        let action: Action = serde_json::from_value(doc.metadata.clone())?;
        actions.push(action);
    }

    Ok(actions)
}

pub async fn create_deterministic_plan(
    query: String,
    non_deterministic_plan: String,
    identified_actions: Vec<Action>,
    messages: Vec<Message>
) -> Result<HashMap<u32, Action>, Error> {
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
            "identified_actions": serde_json::to_value(actions)?.to_string(),
            "plan": non_deterministic_plan
        }),
    )?;

    let json_schema = serde_json::to_value(fs::read_to_string(
        "./public/schemas/create_deterministic_plan_response.txt",
    )?)?;

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await?;

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
        Ok(deterministic_action_plan)
    } else {
        return Err(Error::from("Unable to create a deterministic plan"));
    }
}
