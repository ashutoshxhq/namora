use diesel::{PgConnection, r2d2::{ConnectionManager, self}};
use namora_core::types::{db::DbPool, error::Error};

pub async fn create_pool() -> Result<DbPool, Error> {
    let manager = ConnectionManager::<PgConnection>::new(
        std::env::var("DATABASE_URL").expect("Unable to get database url"),
    );
    let pool = r2d2::Pool::builder()
        .max_size(10)
        .min_idle(Some(1))
        .test_on_check_out(true)
        .build(manager)?;
    Ok(pool)
}

