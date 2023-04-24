mod actions;
mod handler;
mod types;
use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{BasicConsumeArguments, QueueBindArguments, QueueDeclareArguments, BasicAckArguments},
    connection::{Connection, OpenConnectionArguments},
};
use dotenvy::dotenv;
use namora_core::{
    db::create_pool,
    types::{error::Error, worker::WorkerContext},
};
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .with_level(true)
        .with_line_number(true)
        .with_file(true)
        .with_ansi(false)
        .compact()
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let worker_result = worker().await;

    match worker_result {
        Ok(_) => {}
        Err(_err) => {}
    }
}

async fn worker() -> Result<(), Error> {
    let pool = create_pool();
    let connection = Connection::open(&OpenConnectionArguments::new(
        &std::env::var("RABBITMQ_HOST")?,
        std::env::var("RABBITMQ_PORT")?.parse::<u16>()?,
        &std::env::var("RABBITMQ_USERNAME")?,
        &std::env::var("RABBITMQ_PASSWORD")?,
    ))
    .await?;

    connection
        .register_callback(DefaultConnectionCallback)
        .await?;

    // open a channel on the connection
    let channel = connection.open_channel(None).await.unwrap();
    channel.register_callback(DefaultChannelCallback).await?;

    let worker_context = WorkerContext {
        pool: pool.clone(),
        channel: channel.clone(),
    };

    // declare a queue
    let (queue_name, _, _) = channel
        .queue_declare(QueueDeclareArguments::default())
        .await?
        .unwrap();

    // bind the queue to exchange
    let routing_key = std::env::var("RABBITMQ_SYSTEM_WORKER_ROUTING_KEY")?;
    let exchange_name = std::env::var("RABBITMQ_EXCHANGE_NAME")?;

    channel
        .queue_bind(QueueBindArguments::new(
            &queue_name,
            &exchange_name,
            &routing_key,
        ))
        .await?;

    let args = BasicConsumeArguments::new(&queue_name, "system_worker");
    let (_ctag, mut messages_rx) = channel.basic_consume_rx(args).await.unwrap();

    while let Some(msg) = messages_rx.recv().await {
        let message_bytes = msg.content.unwrap();
        let message_str = String::from_utf8(message_bytes.clone())?;
        let worker_ctx = worker_context.clone();

        println!("Message: {:?}", message_str);
        let channel = channel.clone();
        tokio::spawn(async move {
            let message_handler_res = handler::message_handler(worker_ctx, message_str).await;
            match message_handler_res {
                Ok(_) => {
                    tracing::info!("Message handled successfully");
                    let delivery_tag = msg.deliver.unwrap().delivery_tag();
                    channel.basic_ack(BasicAckArguments{
                        delivery_tag,
                        multiple: false
                    }).await.unwrap();
                }
                Err(_err) => {
                    tracing::error!("Error while handling the message");
                }
            };
        });
    }
    Ok(())
}
