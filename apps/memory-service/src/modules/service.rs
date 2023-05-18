use super::memory::service::MemoryService;

#[derive(Clone)]
pub struct NamoraAIService {
    pub memory: MemoryService,
}

impl NamoraAIService {
    pub fn new() -> Self {
        Self {
            memory: MemoryService::new(),
        }
    }
}
