use lapin::Channel;

use super::db::DbPool;


#[derive(Debug, Clone)]
pub struct WorkerContext {
    pub pool: DbPool,
    pub channel: Channel
}