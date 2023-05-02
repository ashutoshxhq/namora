import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { FormInputPasswordField } from "@/design-system/form";

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

const Password = () => {
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
    <div className="grid grid-cols-1 px-4 py-16 max-w-7xl gap-x-8 gap-y-10 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 className="text-base font-semibold leading-7 text-black">
          Change password
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-400">
          Update your password associated with your account.
        </p>
      </div>

      <form className="md:col-span-2" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div className="col-span-full">
            <label
              htmlFor="current-password"
              className="block text-sm font-medium leading-6 text-black"
            >
              Current password
            </label>
            <div className="mt-2">
              <FormInputPasswordField
                id="current-password"
                name="current_password"
                contextId="current-password"
                placeholder="..."
                {...hookFormProps}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium leading-6 text-black"
            >
              New password
            </label>
            <div className="mt-2">
              <FormInputPasswordField
                id="new-password"
                name="new_password"
                contextId="new-password"
                placeholder="..."
                {...hookFormProps}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium leading-6 text-black"
            >
              Confirm password
            </label>
            <div className="mt-2">
              <FormInputPasswordField
                id="confirm-passwordd"
                name="confirm_password"
                contextId="confirm-passwordd"
                placeholder="..."
                {...hookFormProps}
              />
            </div>
          </div>
        </div>

        <div className="flex mt-8">
          <button
            type="submit"
            className="px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Password;
