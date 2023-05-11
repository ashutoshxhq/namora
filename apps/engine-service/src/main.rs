mod authz;
mod db;
mod modules;
mod state;
use axum::{error_handling::HandleErrorLayer, http::StatusCode, BoxError, Extension, Router};
use dotenvy::dotenv;
use modules::*;
use std::{env, net::SocketAddr, time::Duration};
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::Level;
use tracing_subscriber::{FmtSubscriber, fmt::format::FmtSpan};

use crate::{db::create_pool, state::NamoraAIState};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let subscriber = FmtSubscriber::builder()
    .with_max_level(Level::DEBUG)
    .with_level(true)
    .with_line_number(true)
    .with_file(true)
    .with_thread_ids(true)
    .json()
    .with_ansi(false)
    .with_span_events(FmtSpan::CLOSE)
    .finish();
    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let db_url = std::env::var("ENGINE_SERVICE_DATABASE_URL").expect("Unable to get database url");
    let pool = create_pool(db_url).await.unwrap();
    let app = Router::new().merge(router::router()).layer(
        ServiceBuilder::new()
            .layer(HandleErrorLayer::new(|error: BoxError| async move {
                if error.is::<tower::timeout::error::Elapsed>() {
                    Ok(StatusCode::REQUEST_TIMEOUT)
                } else {
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Unhandled internal error: {}", error),
                    ))
                }
            }))
            .timeout(Duration::from_secs(10))
            .layer(TraceLayer::new_for_http())
            .layer(Extension(NamoraAIState::new(pool)))
            .layer(
                CorsLayer::new()
                    .allow_origin(Any)
                    .allow_methods(Any)
                    .allow_headers(Any),
            )
            .into_inner(),
    );

    let addr = SocketAddr::from((
        [0, 0, 0, 0],
        env::var("PORT")
            .expect("Please set port in .env")
            .parse::<u16>()
            .unwrap(),
    ));
    tracing::debug!("Server started, listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
