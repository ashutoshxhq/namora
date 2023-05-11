mod execute;
mod query;
mod response;
use namora_core::types::{
    error::Error,
    message::{Action, Message, MessageWithContext},
};
use serde_json::json;

use crate::actions;

pub struct TaskOrchestrator {}

impl TaskOrchestrator {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn orchestrate(
        &self,
        message_with_context: MessageWithContext,
    ) -> Result<Vec<MessageWithContext>, Error> {
        tracing::info!(
            "Orchestrating message: {:?}",
            message_with_context.message.content
        );
        let response = match message_with_context.message.message_type.as_str() {
            "query" => self.query_handler(message_with_context).await?,
            "execute_action" => self.execute_action_handler(message_with_context).await?,
            "response" => self.response_handler(message_with_context).await?,
            _ => self.query_handler(message_with_context).await?,
        };
        Ok(response)
    }

    async fn query_handler(
        &self,
        message_with_context: MessageWithContext,
    ) -> Result<Vec<MessageWithContext>, Error> {
        tracing::info!("Handling query");
        let query = message_with_context.message.content.clone();
        tracing::info!("Query: {:?}", query);
        tracing::info!("Trying to find if action execution plan is required");
        let is_action_execution_plan_required = query::is_action_execution_plan_required(
            query.clone(),
            message_with_context
                .context
                .execution_context
                .executed_actions
                .clone(),
            message_with_context.context.messages.clone(),
        )
        .await?;
        if is_action_execution_plan_required {
            tracing::info!("Action execution plan is required");
            tracing::info!("Identifying initial actions to create a non-deterministic plan");
            let identified_actions = query::identify_actions(query.clone(), 10).await?;

            tracing::info!("Creating non-deterministic plan");
            let non_deterministic_plan = query::create_non_deterministic_plan(
                query.clone(),
                message_with_context.context.messages.clone(),
                identified_actions.clone(),
            )
            .await?;

            tracing::info!("Identifying actions using the non-deterministic plan");
            let idntified_actions =
                query::identify_actions(non_deterministic_plan.clone(), 5).await?;

            tracing::info!("Creating deterministic plan");
            let deterministic_plan = query::create_deterministic_plan(
                query.clone(),
                non_deterministic_plan.clone(),
                idntified_actions,
                message_with_context.context.messages.clone(),
            )
            .await?;
            tracing::info!("Deterministic plan created");

            tracing::info!("Creating message to execute the first action");
            let mut context = message_with_context.context.clone();
            context.execution_context.deterministic_plan = Some(deterministic_plan.clone());
            context.execution_context.non_deterministic_plan = Some(non_deterministic_plan);
            context.execution_context.user_query = Some(query);

            let message_with_context = MessageWithContext {
                message: Message {
                    message_type: "execute_action".to_string(),
                    content: "Message to execute the first action".to_string(),
                    reciever: "system".to_string(),
                    additional_info: Some(json!({
                        "action": deterministic_plan[&1].clone(),
                    })),
                    created_at: chrono::Utc::now().into(),
                },
                context,
            };
            tracing::info!("Message to execute the first action created");

            tracing::info!("Returning message to execute the first action");
            Ok(vec![message_with_context])
        } else {
            tracing::info!("Action execution plan is not required");

            tracing::info!("Creating message to generate user response");
            let mut context = message_with_context.context.clone();
            context.execution_context.user_query = Some(query);
            let message_with_context = MessageWithContext {
                message: Message {
                    message_type: "response".to_string(),
                    reciever: "system".to_string(),
                    content: "Message to generate user response".to_string(),
                    additional_info: None,
                    created_at: chrono::Utc::now().into(),
                },
                context,
            };

            tracing::info!("Message to generate user response created");
            tracing::info!("Returning message to generate user response");
            Ok(vec![message_with_context])
        }
    }

    async fn execute_action_handler(
        &self,
        message_with_context: MessageWithContext,
    ) -> Result<Vec<MessageWithContext>, Error> {
        tracing::info!("Handling execute action");
        tracing::info!("Extacting current action");
        let current_action = message_with_context
            .message
            .additional_info
            .clone()
            .unwrap()
            .get("action")
            .unwrap()
            .clone();
        let current_action: Action = serde_json::from_value(current_action)?;

        tracing::info!("Extracting action input from context");
        let action_input = execute::extract_action_input(
            message_with_context
                .context
                .execution_context
                .user_query
                .clone()
                .unwrap(),
            message_with_context
                .context
                .execution_context
                .executed_actions
                .clone(),
            current_action.clone(),
            message_with_context.context.messages.clone(),
        )
        .await?;
    

        tracing::info!("Executing action: {:?}", current_action.id);
        let action_result = actions::router::route(
            message_with_context.context.clone(),
            current_action.id.clone(),
            action_input,
        )
        .await?;
        tracing::info!("Action executed");

        tracing::info!("Creating message to generate user response");
        let mut context = message_with_context.context.clone();
        let mut executed_action = current_action.clone();
        executed_action.acion_result = Some(action_result.clone());
        context
            .execution_context
            .executed_actions
            .push(executed_action);

        let message_with_context = MessageWithContext {
            message: Message {
                message_type: "response".to_string(),
                content: "Message to generate user response".to_string(),
                reciever: "system".to_string(),
                additional_info: None,
                created_at: chrono::Utc::now().into(),
            },
            context,
        };
        tracing::info!("Message to generate user response created");

        tracing::info!("Trying to find next action from deterministic plan");
        let mut next_action = None;

        if let Some(deterministic_plan) = message_with_context
            .context
            .execution_context
            .deterministic_plan
            .clone()
        {
            let mut next_action_index = None;
            for (index, action) in deterministic_plan.iter() {
                if action.id == current_action.id {
                    tracing::info!("Next action found, {:?}", action.id);
                    next_action_index = Some(index + 1);
                    break;
                }
            }
            if let Some(index) = next_action_index {
                if let Some(action) = deterministic_plan.get(&index) {
                    next_action = Some(action.clone());
                }
            }
        }
        
        if let Some(next_action) = next_action {
            tracing::info!("Message to execute next action created");
            let context = message_with_context.context.clone();
            let message_with_context = MessageWithContext {
                message: Message {
                    message_type: "execute_action".to_string(),
                    content: "Message to execute the provided action".to_string(),
                    reciever: "system".to_string(),
                    additional_info: Some(json!({
                        "action": next_action.clone(),
                    })),
                    created_at: chrono::Utc::now().into(),
                },
                context,
            };
            tracing::info!("Message to execute next action created");
            return Ok(vec![message_with_context]);
        } else {
            tracing::info!("No next action found, so creating message to generate user response");
            let context = message_with_context.context.clone();
            let message_with_context = MessageWithContext {
                message: Message {
                    message_type: "response".to_string(),
                    content: "Message to generate user response".to_string(),
                    reciever: "system".to_string(),
                    additional_info: None,
                    created_at: chrono::Utc::now().into(),
                },
                context,
            };
            tracing::info!("Message to generate user response created");
            return Ok(vec![message_with_context]);
        }
    }

    async fn response_handler(
        &self,
        message_with_context: MessageWithContext,
    ) -> Result<Vec<MessageWithContext>, Error> {
        tracing::info!("Handling user response");

        tracing::info!("Generating user response");
        let user_response_message = response::generate_user_response(
            message_with_context
                .context
                .execution_context
                .user_query
                .clone()
                .unwrap(),
            message_with_context
                .context
                .execution_context
                .executed_actions
                .clone(),
            message_with_context.context.messages.clone(),
        )
        .await?;
        tracing::info!("Generated user response");

        tracing::info!("Creating message to send user response");
        let mut context = message_with_context.context.clone();
        context.execution_context.user_query = None;
        context.execution_context.deterministic_plan = None;
        context.execution_context.non_deterministic_plan = None;
        let message = Message {
            reciever: "user".to_string(),
            content: user_response_message,
            message_type: "response".to_string(),
            additional_info: None,
            created_at: chrono::Utc::now().into(),
        };
        context.messages.push(message.clone());

        let message_with_context = MessageWithContext { message, context };
        tracing::info!("Message to send user response created");
        Ok(vec![message_with_context])
    }
}
