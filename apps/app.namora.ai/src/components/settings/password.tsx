import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  current_password: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
  new_password: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
  confirm_password: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

export const Password = () => {
  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        current_password: "",
        new_password: "",
        confirm_password: "",
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
    <div className="grid grid-cols-1 gap-6 py-2">
      <div className="z-0 flex items-center justify-center w-full px-4 py-4 overflow-hidden bg-white shadow sm:rounded-md sm:px-6 gap-x-6 ">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="flex items-center justify-between w-full gap-4">
            <h2 className="text-base font-semibold leading-7 text-black">
              Reset your Password via Email
            </h2>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Send email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
