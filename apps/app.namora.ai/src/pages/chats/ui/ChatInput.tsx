import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { FormInputTextField } from "@/design-system/form";

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

const ChatInput = () => {
  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        message: "",
      },
      resolver: yupResolver(schema),
    }),
    []
  );
  const hookFormProps = useForm(useFormObj);

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    handleClickOnSendMessage(submittedFormData);
  };
  const handleClickOnSendMessage = (submittedFormData: any) => {
    // let data = JSON.stringify({
    //   Data: {
    //     message_from: "USER",
    //     message_to: "AI",
    //     message: submittedFormData.message,
    //   },
    // });
    // const encoder = new TextEncoder();
    // const binaryData = encoder.encode(data);
    // console.log("Sending", { data, binaryData });
    console.log({ submittedFormData });
    // web_socket.send(binaryData.buffer)
  };

  const { handleSubmit } = hookFormProps;

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

export default ChatInput;
