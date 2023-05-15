import Image from "next/image";
import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

import { Alert } from "@/design-system/molecules/alert";
import { FormInputTextField, FormInputEmailField } from "@/design-system/form";

const schema = yup.object().shape({
  first_name: yup.string(),
  last_name: yup.string(),
  email: yup.string().email().required("Required"),
  username: yup.string(),
});

export const PersonalDetails = () => {
  const [showAlert, setShowAlert] = useState(false);
  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        company_position: "",
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
    // web_socket.send(binaryData.buffer)
    setShowAlert(true);
  };

  const alertProps = {
    title: "Account/Profile",
    description: "something...",
    show: showAlert,
    status: "",
    setShow: setShowAlert,
  };
  const { handleSubmit } = hookFormProps;

  return (
    <>
      <div className="px-4 py-4 my-3 bg-white shadow sm:rounded-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid grid-cols-1 mt-10 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  First name
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="first-name"
                    name="first_name"
                    contextId="first-name"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="last-name"
                    name="last_name"
                    contextId="last-name"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Email
                </label>
                <div className="mt-2">
                  <FormInputEmailField
                    id="email"
                    name="email"
                    contextId="email"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Username
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="username"
                    name="username"
                    contextId="username"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="company-position"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Company position
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="company-position"
                    name="company_position"
                    contextId="company-position"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>
            </div>

            <div className="flex my-8">
              <button
                type="submit"
                className="px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Update account & company
              </button>
            </div>
          </form>
        </div>
      </div>
      <Alert {...alertProps} />
    </>
  );
};
