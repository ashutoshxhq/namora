import React from "react";

import { FormInputTextField } from "@/design-system/form";
import { useChatInput } from "./useChatInput";

export const ChatInput = () => {
  const {
    divRef,
    messageGroupData,
    hookFormProps,
    webSocketMsg,
    isSocketConnectionAvailable,
  }: any = useChatInput();
  const { handleSubmit, onFormSubmit } = hookFormProps;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <FormInputTextField
        id="chat_message_input"
        name="message"
        contextId="chat_message_input"
        placeholder="Ask something and press Enter"
        {...hookFormProps}
      />
    </form>
  );
};
