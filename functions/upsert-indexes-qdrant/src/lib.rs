use std::{collections::HashMap, fs};

use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use axum::Json;

use dotenvy::dotenv;
use namora_core::types::message::Action;
use qdrant_client::{
    prelude::{Payload, QdrantClient, QdrantClientConfig},
    qdrant::PointStruct,
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Serialize, Deserialize, JsonSchema, Debug)]
pub struct Document {
    pub id: String,
    pub data: String,
    pub metadata: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug)]
pub struct DocumentWithEmbeddings {
    pub id: String,
    pub metadata: Value,
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
    let config = QdrantClientConfig::from_url("http://localhost:6334");
    let qdrant_client = QdrantClient::new(Some(config)).await.unwrap();

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

    let mut points = Vec::new();

    for (action, embedding) in actions.iter().zip(response.data.iter()) {

        let metadata = json!({
            "id": action.id.clone(),
            "name": action.name.clone(),
            "description": action.description.clone(),
            "input_json_schema": action.input_json_schema.clone(),
            "sample_queries": action.sample_queries.clone(),
        });
        
        let payload: Payload = metadata
            .try_into()
            .unwrap();
    
        points.push(PointStruct::new(
            Uuid::new_v4().to_string(),
            embedding.embedding.clone(),
            payload,
        ));
    }

    qdrant_client
        .upsert_points_blocking("actions", points, None)
        .await
        .unwrap();

    Json(json!({
        "status": "ok",
        "data": {},
    }))
}

#[cfg(test)]
mod tests {
    use crate::handler;

    #[test]
    fn case_it_works() {
        let _result = tokio_test::block_on(handler()).0;

        // println!("{:?}", _result);

        assert_eq!(true, true);
    }
}
