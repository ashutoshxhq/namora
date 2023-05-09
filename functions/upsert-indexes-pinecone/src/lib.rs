use std::{collections::HashMap, env, fs};

use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use axum::Json;

use dotenvy::dotenv;
use namora_core::types::message::Action;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize, JsonSchema, Debug)]
pub struct Document {
    pub id: String,
    pub data: String,
    pub metadata: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug)]
pub struct DocumentWithEmbeddings {
    pub id: String,
    pub metadata: HashMap<String, String>,
    pub values: Vec<f32>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug)]
pub struct Input {
    pub context: Option<Value>,
    pub documents: Vec<Document>,
    pub namespace: String,
}

pub async fn handler() -> Json<Value> {
    dotenv().ok();

    let actions = fs::read_to_string("./../../resources/actions.json").unwrap();
    let actions = serde_json::from_str::<Vec<Action>>(&actions).unwrap();

    let actions_str_vec = actions
        .iter()
        .map(|action| serde_json::to_value(action).unwrap().to_string())
        .collect::<Vec<String>>();

    let client = Client::new();
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-ada-002")
        .input(actions_str_vec)
        .build()
        .unwrap();
    let response = client.embeddings().create(request).await.unwrap();
    let mut documents_with_embeddings: Vec<DocumentWithEmbeddings> = Vec::new();

    for (action, embedding) in actions.iter().zip(response.data.iter()) {
        let mut metadata = HashMap::new();
        metadata.insert("id".to_string(), action.id.clone());
        metadata.insert("name".to_string(), action.name.clone());
        metadata.insert("description".to_string(), action.description.clone());
        metadata.insert("input_format".to_string(), action.input_json_schema.to_string().clone());
        metadata.insert("additional_info".to_string(), action.additional_info.clone().unwrap_or("".to_string()));
        metadata.insert("sample_queries".to_string(), action.sample_queries.clone().join(", "));
        
        documents_with_embeddings.push(DocumentWithEmbeddings {
            id: action.id.clone(),
            values: embedding.embedding.clone(),
            metadata
        });
    }

    let client = reqwest::Client::new();
    let pinecone_api_key = env::var("PINECONE_API_KEY").unwrap();
    let pinecone_index_host = env::var("PINECONE_INDEX_HOST").unwrap();

    let response = client
        .post(format!("https://{}/vectors/upsert", pinecone_index_host))
        .json(&json!({
          "vectors": documents_with_embeddings,
          "namespace": "actions",
        }))
        .header("Api-Key", pinecone_api_key)
        .send()
        .await
        .unwrap();

    if response.status().is_success() {
        Json(json!({
            "status": "ok",
            "data": response.json::<Value>().await.unwrap(),
        }))
    } else {
        Json(json!({
            "status": "error",
            "message": "Something went wrong",
            "response": response.text().await.unwrap(),
        }))
    }
}

#[cfg(test)]
mod tests {
    use crate::handler;

    #[test]
    fn case_it_works() {
        let _result = tokio_test::block_on(handler()).0;

        println!("{:?}", _result);

        assert_eq!(true, true);
    }
}
