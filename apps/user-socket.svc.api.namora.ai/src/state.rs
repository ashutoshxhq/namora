
use lapin::Channel;
use crate::modules::service::NamoraAIService;

#[derive(Clone)]
pub struct NamoraAIState {
    pub channel: Channel,
    pub services: NamoraAIService,
}

impl NamoraAIState {
    pub fn new(channel: Channel) -> Self {
        Self {
            services: NamoraAIService::new(),
            channel,
        }
    }
}
