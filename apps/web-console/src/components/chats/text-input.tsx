import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { FormInputTextField } from "@/design-system/form";
import { webSocket } from "@/web-sockets";
import { useFetchAccessToken } from "@/auth0/hooks";
import { useCurrentUser } from "@/current-user";

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

const encoder = new TextEncoder();

export const TextInput = () => {
  const { data: accessToken } = useFetchAccessToken();
  const { teamId, userId } = useCurrentUser();

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
  const { reset } = hookFormProps;

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    handleClickOnSendMessage(submittedFormData);
  };
  const handleClickOnSendMessage = (submittedFormData: any) => {
    if (accessToken) {
      let data = JSON.stringify({
        Data: {
          content: submittedFormData.message,
          session_id: "8d77a6ab-975b-49c6-871e-707798a22751",
          context: {
            user_id: userId,
            team_id: teamId,
            authorization_token: accessToken,
          },
        },
      });

      const binaryData = encoder.encode(data);
      console.log("Sending first hello message", data, binaryData);
      webSocket?.send(binaryData.buffer);
      reset();
    }
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
