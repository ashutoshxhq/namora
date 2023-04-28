import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

export const useChatInput = () => {
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
    // console.log({ submittedFormData });
    // web_socket.send(binaryData.buffer)
  };

  return {
    hookFormProps: { ...hookFormProps, onFormSubmit },
  };
};
