use std::fs;
use handlebars::Handlebars;
use namora_core::types::{error::Error, message::{Action, Message}};
use serde_json::{json, Value};

use crate::jsonllm::JsonLLM;


pub async fn extract_action_input(
    query: String,
    executed_actions: Vec<Action>,
    action: Action,
    messages: Vec<Message>,
) -> Result<Value, Error> {
    let actions = executed_actions
        .iter()
        .map(|action| {
            let action_output = format!("{:?}", action.clone().acion_result.unwrap_or(json!({})));
            json!({
                "action_id": action.id,
                "action_output": action_output,
            })
        })
        .collect::<Vec<Value>>();

    let prompt = fs::read_to_string("./public/prompts/extract_action_input.txt")?;
    let reg = Handlebars::new();
    let prompt_with_data = reg.render_template(
        &prompt,
        &json!({
            "query": query,
            "executed_actions": format!("{:?}", actions)
        }),
    )?;
    let json_schema: Value = serde_json::from_str(&action.input_json_schema)?;

    let jsonllm = JsonLLM::new(prompt_with_data, json_schema, messages);
    let jsonllm_result = jsonllm.generate().await?;

    Ok(jsonllm_result)
}
