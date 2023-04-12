use super::chat::service::ChatService;

#[derive(Clone)]
pub struct ExecuteAIService {
    pub chat: ChatService,
}

impl ExecuteAIService {
    pub fn new() -> Self {
        Self {
            chat: ChatService::new(),
        }
    }
}
