use crate::modules::service::NamoraAIService;

#[derive(Clone)]
pub struct NamoraAIState {
    pub services: NamoraAIService,
}

impl NamoraAIState {
    pub fn new() -> Self {
        Self {
            services: NamoraAIService::new(),
        }
    }
}
