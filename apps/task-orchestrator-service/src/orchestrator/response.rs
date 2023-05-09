use std::fs;
use handlebars::Handlebars;
use namora_core::types::{error::Error, message::{Action, Message}};
use serde_json::{json, Value};

use crate::jsonllm::JsonLLM;

pub async fn generate_user_response(
    query: String,
    executed_actions: Vec<Action>,
    messages: Vec<Message>
) -> Result<String, Error> {
    let actions = executed_actions
        .iter()
        .map(|action| {
            json!({
                "action_id": action.id,
                "action_output": action.acion_result,
            })
        })
        .collect::<Vec<Value>>();

    let prompt = fs::read_to_string("./public/prompts/generate_user_response.txt")?;
    let reg = Handlebars::new();
    let prompt_with_data = reg.render_template(
        &prompt,
        &json!({
            "query": query,
            "executed_actions": actions
        }),
    )?;
    let json_schema = serde_json::from_str(&fs::read_to_string(
        "./public/schemas/generate_user_response.txt",
    )?)?;

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await?;

    let message = jsonllm_result.get("message");
    if let Some(message) = message {
        match message.as_str() {
            Some(message) => {
                return Ok(message.to_string());
            }
            None => {
                return Err(Error::from(
                    "Serialization to string failes, Unable to generate user response",
                ));
            }
        }
    } else {
        return Err(Error::from(
            "Unable to generate user response",
        ));
    }
}
