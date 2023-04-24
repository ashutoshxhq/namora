mod handler;
use amqprs::{
    callbacks::{DefaultChannelCallback, DefaultConnectionCallback},
    channel::{
        BasicAckArguments, BasicConsumeArguments, QueueBindArguments, QueueDeclareArguments,
    },
    connection::{Connection, OpenConnectionArguments},
};
use dotenvy::dotenv;
use namora_core::{
    db::create_pool,
    types::{
        error::{Error, ErrorBuilder},
        worker::WorkerContext,
    },
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
    let channel = connection.open_channel(None).await?;
    channel.register_callback(DefaultChannelCallback).await?;

    let worker_context = WorkerContext {
        pool: pool.clone(),
        channel: channel.clone(),
    };

    if let Some((queue_name, _, _)) = channel
        .queue_declare(QueueDeclareArguments::default())
        .await?
    {
        // bind the queue to exchange
        let routing_key = std::env::var("RABBITMQ_AI_WORKER_ROUTING_KEY")?;
        let exchange_name = std::env::var("RABBITMQ_EXCHANGE_NAME")?;
        channel
            .queue_bind(QueueBindArguments::new(
                &queue_name,
                &exchange_name,
                &routing_key,
            ))
            .await?;

        let args = BasicConsumeArguments::new(&queue_name, "ai_worker");
        let (_consumer_tag, mut messages_rx) = channel.basic_consume_rx(args).await?;

        while let Some(msg) = messages_rx.recv().await {
            if let Some(message_bytes) = msg.content {
                let message_str = String::from_utf8(message_bytes.clone())?;
                let worker_ctx = worker_context.clone();

                println!("Message: {:?}", message_str);
                let channel = channel.clone();

                tokio::spawn(async move {
                    let message_handler_res =
                        handler::message_handler(worker_ctx, message_str).await;
                    match message_handler_res {
                        Ok(_) => {
                            tracing::info!("Message handled successfully");
                            if let Some(deliver) = msg.deliver {
                                let delivery_tag = deliver.delivery_tag();
                                let res = channel
                                    .basic_ack(BasicAckArguments {
                                        delivery_tag,
                                        multiple: false,
                                    })
                                    .await;
                                match res {
                                    Ok(_res) => {}
                                    Err(err) => {
                                        tracing::error!("Error: {:?}", err);
                                    }
                                }
                            } else {
                                tracing::error!("No delivery tag found");
                            }
                        }
                        Err(_err) => {
                            tracing::error!("Error while handling the message");
                        }
                    };
                });
            } else {
                tracing::error!("Unable to parse message");
                return Err(ErrorBuilder::new(
                    "INTERNAL_SERVER_ERROR",
                    "Something went wrong parsing message",
                ));
            }
        }
        Ok(())
    } else {
        tracing::error!("Unable to declare queue");
        Err(ErrorBuilder::new(
            "INTERNAL_SERVER_ERROR",
            "Something went wrong declaring a queue",
        ))
    }
}
