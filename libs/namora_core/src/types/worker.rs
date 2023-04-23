use amqprs::channel::Channel;
use super::db::DbPool;


#[derive(Clone)]
pub struct WorkerContext {
    pub pool: DbPool,
    pub channel: Channel
}