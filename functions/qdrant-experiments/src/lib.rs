use axum::Json;
use dotenvy::dotenv;
use serde_json::{json, Value};
use qdrant_client::prelude::*;
use qdrant_client::qdrant::vectors_config::Config;
use qdrant_client::qdrant::{CreateCollection, VectorParams, VectorsConfig};

pub async fn handler() -> Json<Value> {
    dotenv().ok();
    let config = QdrantClientConfig::from_url("http://localhost:6334");
    let client = QdrantClient::new(Some(config)).await.unwrap();
   let collection_info = client.collection_info("actions").await.unwrap();
    println!("collection_info: {:?}", collection_info);

    // Create collections: actions, execution-contexts
    client
    .create_collection(&CreateCollection {
        collection_name: "actions".to_string(),
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
    .await.unwrap();


    client
    .create_collection(&CreateCollection {
        collection_name: "execution-contexts".to_string(),
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
    .await.unwrap();
    client.delete_collection("actions").await.unwrap();
    client.delete_collection("execution-contexts").await.unwrap();
    let collections_list = client.list_collections().await.unwrap();
    dbg!(collections_list);

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
        assert_eq!(true, true);
    }
}
