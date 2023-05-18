use namora_core::types::error::Error;

use super::types::{IndexMemoriesRequest, RetrieveMemoriesRequest, RetrieveMemoriesResponse};

#[derive(Clone)]
pub struct MemoryService {}

impl MemoryService {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn retrieve_memories(
        &self,
        data: RetrieveMemoriesRequest,
    ) -> Result<RetrieveMemoriesResponse, Error> {
        Ok(RetrieveMemoriesResponse {
            documents: vec![],
            offset: 0,
            total: 0,
        })
    }

    pub async fn index_memories(&self, data: IndexMemoriesRequest) -> Result<(), Error> {
        Ok(())
    }
}
