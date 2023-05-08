use std::{collections::HashMap, env, fs};

use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, CreateEmbeddingRequestArgs, Role,
    },
    Client,
};
use handlebars::Handlebars;
use namora_core::types::{
    error::Error,
    message::{Action, Message},
};
use serde_json::{json, Value};

use crate::types::pinecone::PineconeQueryResponse;

pub async fn initial_query_handler(message: Message) -> Result<Message, Error> {
    let initial_query_handler_system_message =
        fs::read_to_string("./prompts/system/initial_query.txt")?;
    let reg = Handlebars::new();
    let initial_query_handler_system_message_with_data =
        reg.render_template(&initial_query_handler_system_message, &json!({}))?;

    let client: Client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
    let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::System)
            .content(initial_query_handler_system_message_with_data)
            .build()?,
    );
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::User)
            .content(serde_json::to_value(message.clone())?.to_string())
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

    Ok(message)
}

pub async fn find_actions_for_plan(plan: Vec<String>) -> Result<Vec<Action>, Error> {
    let mut actions: Vec<Action> = Vec::new();
    let non_deterministic_plan_str = serde_json::to_string(&plan)?;

    let client = Client::new();
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-ada-002")
        .input(non_deterministic_plan_str)
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
    non_deterministic_plan: Vec<String>,
    identified_actions: Vec<Action>,
    executed_actions: Vec<Action>,
) -> Result<HashMap<u32, Action>, Error> {
    let initial_query_handler_system_message =
        fs::read_to_string("./system/create_deterministic_plan.txt")?;
    let reg = Handlebars::new();
    let actions = identified_actions.iter().map(|action| json!({
        "action_id": action.id,
        "action_name": action.name,
    })).collect::<Vec<Value>>();
    let initial_query_handler_system_message_with_data = reg.render_template(
        &initial_query_handler_system_message,
        &json!({
            "query": query,
            "plan": non_deterministic_plan,
            "actions": serde_json::to_value(actions).unwrap().to_string(),
            "executed_actions": executed_actions,
        }),
    )?;
    tracing::info!("initial_query_handler_system_message_with_data: {:?}", initial_query_handler_system_message_with_data);
    let client: Client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
    let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::System)
            .content(initial_query_handler_system_message_with_data)
            .build()?,
    );
    messages.push(
        ChatCompletionRequestMessageArgs::default()
            .role(Role::User)
            .content("create a plan based on the given data")
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
    let ordered_action_ids: HashMap<String, String> = serde_json::from_value(
        message
            .additional_info
            .data
            .unwrap()
            .get("deterministic_plan")
            .unwrap()
            .clone(),
    )
    .unwrap();

    let mut deterministic_plan: HashMap<u32, Action> = HashMap::new();

    for (id, action_id) in ordered_action_ids.iter() {
        for action in &identified_actions {
            if action.id == action_id.clone() {
                deterministic_plan.insert(id.parse::<u32>().unwrap(), action.clone());
            }
        }
    }

    Ok(deterministic_plan)
}
