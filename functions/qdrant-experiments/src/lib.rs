use axum::Json;
use dotenvy::dotenv;
use serde_json::{json, Value};
use anyhow::Result;
use qdrant_client::prelude::*;
use qdrant_client::qdrant::vectors_config::Config;
use qdrant_client::qdrant::{CreateCollection, SearchPoints, VectorParams, VectorsConfig};

pub async fn handler() -> Json<Value> {
    dotenv().ok();
    let config = QdrantClientConfig::from_url("http://localhost:6334");
    let client = QdrantClient::new(Some(config)).await.unwrap();

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

        println!("{:?}", _result);

        assert_eq!(true, true);
    }
}
