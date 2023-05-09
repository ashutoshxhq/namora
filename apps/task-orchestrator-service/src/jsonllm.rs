use std::fs;

use async_openai::{
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use handlebars::Handlebars;
use jsonschema::JSONSchema;
use namora_core::types::{error::Error, message::Message};
use serde_json::{json, Value};

pub struct JsonLLM {
    prompt: String,
    json_schema: Value,
    messages: Vec<Message>
}

impl JsonLLM {
    pub fn new(prompt: String, json_schema: Value, messages: Vec<Message>) -> Self {
        Self {
            prompt,
            json_schema,
            messages
        }
    }

    pub fn prompt(&self) -> String {
        self.prompt.clone()
    }

    pub fn json_schema(&self) -> Value {
        self.json_schema.clone()
    }

    pub async fn generate(&self) -> Result<Value, Error> {
        let jsonllm_message = fs::read_to_string("./public/prompts/jsonllm.txt")?;
        let reg = Handlebars::new();
        let mut past_conversation = String::new();
        for message in self.messages.iter() {
            if message.reciever == "system" {
                past_conversation.push_str(&format!("User: {}\n",message.content));
            } else{
                past_conversation.push_str(&format!("Assistant: {}\n",message.content));
            }
        }
        let jsonllm_message_with_data = reg.render_template(
            &jsonllm_message,
            &json!({
                "prompt": self.prompt(),
                "json_schema": self.json_schema().to_string(),
                "past_conversation": past_conversation
            }),
        )?;

        let client: Client = Client::new().with_api_key(std::env::var("OPENAI_API_KEY")?);
        let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();
        tracing::info!("Prompt: {}", jsonllm_message_with_data);
        messages.push(
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content(jsonllm_message_with_data.clone())
                .build()?,
        );
        let request = CreateChatCompletionRequestArgs::default()
            .model("gpt-4")
            .messages(messages)
            .build()?;

        let response = client.chat().create(request).await?;
        tracing::info!("AI Response: {:?}", response.choices[0].message.content);
        let data: Value = serde_json::from_str(&(response.choices[0].message.content))?;
        let schema = self.json_schema().clone();
        tracing::info!("Schema: {:?}", schema);
        tracing::info!("Data: {:?}", data);
        let compiled = JSONSchema::compile(&schema);
        match compiled {
            Ok(compiled) => {
                tracing::info!("Schema is valid");
                let data_to_validate = data.clone();
                let result = compiled.validate(&data_to_validate);
                match result {
                    Ok(_) => {
                        tracing::info!("Data is valid");
                        return Ok(data);
                    }
                    Err(errors) => {
                        tracing::info!("Data is invalid");
                        for error in errors {
                            tracing::info!("Validation error: {}", error);
                        }
                        return Err(Error::from("Data is invalid"));
                    }
                }
            }
            Err(error) => {
                tracing::info!("Schema is invalid");
                tracing::info!("Validation error: {}", error);
                return Err(Error::from("Schema is invalid"));
            }
        }
    }
}
