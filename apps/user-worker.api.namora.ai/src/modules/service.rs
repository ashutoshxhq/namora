use super::chat::service::ChatService;

#[derive(Clone)]
pub struct NamorAIService {
    pub chat: ChatService,
}

impl NamorAIService {
    pub fn new() -> Self {
        Self {
            chat: ChatService::new(),
        }
    }
}
