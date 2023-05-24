use std::collections::HashMap;

use async_openai::{types::CreateEmbeddingRequestArgs, Client};
use namora_core::types::error::Error;
use qdrant_client::{
    prelude::{Payload, QdrantClient, QdrantClientConfig},
    qdrant::{
        vectors_config::Config, CreateCollection, Distance, PointStruct, VectorParams,
        VectorsConfig,
    },
};
use serde_json::Value;
use uuid::Uuid;

use super::types::{IndexMemoriesRequest, RetrieveMemoriesRequest, RetrieveMemoriesResponse};

#[derive(Clone)]
pub struct MemoryService {}

impl MemoryService {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn retrieve_memories(
        &self,
        _data: RetrieveMemoriesRequest,
    ) -> Result<RetrieveMemoriesResponse, Error> {
        Ok(RetrieveMemoriesResponse {
            memories: vec![],
            offset: 0,
            total: 0,
        })
    }

    pub async fn index_memories(
        &self,
        team_id: Uuid,
        data: IndexMemoriesRequest,
    ) -> Result<(), Error> {
        let config = QdrantClientConfig::from_url("http://qdrant-vector-db:6334");
        let qdrant_client = QdrantClient::new(Some(config)).await.unwrap();

        self.setup_collections(team_id).await?;
        let mut memories = Vec::new();
        for memory in &data.memories {
            let mut data: HashMap<String, Value> =
                serde_json::from_value(serde_json::to_value(memory.data.clone())?)?;
            data.insert(
                "features".to_string(),
                serde_json::to_value(memory.features.clone())?,
            );
            memories.push(data);
        }

        let memories_vec_str = memories
            .iter()
            .map(|memory| serde_json::to_string(memory).unwrap())
            .collect::<Vec<String>>();

        let openai_client = Client::new();
        let request = CreateEmbeddingRequestArgs::default()
            .model("text-embedding-ada-002")
            .input(memories_vec_str)
            .build()
            .unwrap();
        let response = openai_client.embeddings().create(request).await.unwrap();

        let mut email_points = Vec::new();
        let mut generic_points = Vec::new();

        for (memory, embedding) in memories.iter().zip(response.data.iter()) {
            if let Some(memory_type) = memory.get("memory_type") {
                let mut payload: Payload = Payload::new();
                for (key, value) in memory.iter() {
                    payload.insert(key, serde_json::to_string(value)?)
                }
                if memory_type.to_string() == "email" {
                    tracing::info!("memory is of type email, indexing in email collection");
                    email_points.push(PointStruct::new(
                        Uuid::new_v4().to_string(),
                        embedding.embedding.clone(),
                        payload,
                    ));
                } else {
                    tracing::info!("memory is of type generic, indexing in generic collection");
                    generic_points.push(PointStruct::new(
                        Uuid::new_v4().to_string(),
                        embedding.embedding.clone(),
                        payload,
                    ));
                }
            }
        }

        if !generic_points.is_empty() {
            let generic_memories_collection = format!("{}_generic_memories", team_id.to_string());
            qdrant_client
                .upsert_points(generic_memories_collection, generic_points, None)
                .await?;
        }

        if !email_points.is_empty() {
            let email_memories_collection = format!("{}_email_memories", team_id.to_string());
            qdrant_client
                .upsert_points(email_memories_collection, email_points, None)
                .await?;
        }
        Ok(())
    }

    pub async fn setup_collections(&self, team_id: Uuid) -> Result<(), Error> {
        let config = QdrantClientConfig::from_url("http://qdrant-vector-db:6334");
        let client = QdrantClient::new(Some(config)).await.unwrap();

        let generic_memories_collection = format!("{}_generic_memories", team_id.to_string());
        let has_generic_memories_collection = client
            .has_collection(generic_memories_collection.clone())
            .await?;
        if !has_generic_memories_collection {
            client
                .create_collection(&CreateCollection {
                    collection_name: generic_memories_collection,
                    vectors_config: Some(VectorsConfig {
                        config: Some(Config::Params(VectorParams {
                            size: 1536,
                            distance: Distance::Cosine.into(),
                            hnsw_config: None,
                            quantization_config: None,
                        })),
                    }),
                    ..Default::default()
                })
                .await?;
        }

        let email_memories_collection = format!("{}_email_memories", team_id.to_string());
        let has_email_memories_collection = client
            .has_collection(email_memories_collection.clone())
            .await?;
        if !has_email_memories_collection {
            client
                .create_collection(&CreateCollection {
                    collection_name: email_memories_collection,
                    vectors_config: Some(VectorsConfig {
                        config: Some(Config::Params(VectorParams {
                            size: 1536,
                            distance: Distance::Cosine.into(),
                            hnsw_config: None,
                            quantization_config: None,
                        })),
                    }),
                    ..Default::default()
                })
                .await?;
        }
        Ok(())
    }
}
