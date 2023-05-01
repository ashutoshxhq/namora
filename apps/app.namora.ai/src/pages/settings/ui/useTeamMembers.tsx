import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

const schema = yup.object().shape({
  first_name: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
  last_name: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
  email: yup.string().email().required("Required"),
  username: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

export const useTeamMembers = () => {
  const [showAlert, setShowAlert] = useState(false);
  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        username: "",
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
    setShowAlert(true);
  };

  return {
    showAlert,
    setShowAlert,
    hookFormProps: { ...hookFormProps, onFormSubmit },
  };
};
