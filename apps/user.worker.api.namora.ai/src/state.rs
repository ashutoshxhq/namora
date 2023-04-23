
use crate::modules::service::NamorAIService;

#[derive(Clone)]
pub struct NamorAIState {
    pub services: NamorAIService,
}

impl NamorAIState {
    pub fn new() -> Self {

        Self {
            services: NamorAIService::new()
        }
    }
}
