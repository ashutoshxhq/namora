mod handler;
mod types;
mod actions;
mod jobs;
use aws_config::meta::region::RegionProviderChain;
use dotenvy::dotenv;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;
use types::Error;

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
    let region_provider =
        RegionProviderChain::first_try(aws_types::region::Region::new("us-west-2"));
    let shared_config = aws_config::from_env().region(region_provider).load().await;
    let client = aws_sdk_sqs::Client::new(&shared_config);
    let queue_url = std::env::var("CHAT_SYSTEM_SQS_URL").expect("CHAT_SYSTEM_SQS_URL must be set");

    let worker_result = worker(client, queue_url).await;

    match worker_result {
        Ok(_) => {}
        Err(_err) => {}
    }
}

async fn worker(client: aws_sdk_sqs::Client, queue_url: String) -> Result<(), Error> {
    loop {
        let sqs_client = client.clone();
        let sqs_queue_url = queue_url.clone();

        let rcv_message_output = sqs_client
            .clone()
            .receive_message()
            .set_wait_time_seconds(Some(10))
            .max_number_of_messages(1)
            .queue_url(sqs_queue_url.clone())
            .send()
            .await?;

        if let Some(messages) = rcv_message_output.messages {
            for message in messages {
                let sqs_client = client.clone();
                let sqs_queue_url = queue_url.clone();
                tokio::spawn(async move {
                    let message_handler_res = handler::message_handler(message.clone()).await;
                    match message_handler_res {
                        Ok(_) => {}
                        Err(_err) => {}
                    };
                    if let Some(receipt_handler) = message.receipt_handle {
                        let delete_message_output_res = sqs_client
                            .delete_message()
                            .queue_url(sqs_queue_url.clone())
                            .receipt_handle(receipt_handler)
                            .send()
                            .await;
                        match delete_message_output_res {
                            Ok(_) => {}
                            Err(_err) => {}
                        };
                    } else{
                        tracing::info!("No receipt handler to delete the message")
                    }
                });
            }
        } else {
            tracing::info!("No Messages found in request");
            continue;
        }
    }
}
