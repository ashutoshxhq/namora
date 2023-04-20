
use crate::modules::service::ExecuteAIService;

#[derive(Clone)]
pub struct ExecuteAIState {
    pub services: ExecuteAIService,
}

impl ExecuteAIState {
    pub fn new() -> Self {

        Self {
            services: ExecuteAIService::new()
        }
    }
}
