use diesel::{PgConnection, r2d2::{ConnectionManager, Pool, self}};

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

pub fn create_pool() -> DbPool {
    let manager = ConnectionManager::<PgConnection>::new(
        std::env::var("DATABASE_URL").expect("Unable to get database url"),
    );
    let pool = r2d2::Pool::builder()
        .max_size(10)
        .min_idle(Some(1))
        .test_on_check_out(true)
        .build(manager)
        .unwrap();
    pool
}

