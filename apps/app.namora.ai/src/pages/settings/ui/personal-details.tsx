import Image from "next/image";
import { useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

import { Alert } from "@/design-system/molecules/alert";
import { FormInputTextField, FormInputEmailField } from "@/design-system/form";

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

const PersonalDetails = () => {
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

  const alertProps = {
    title: "Account/Profile",
    description: "something...",
    show: showAlert,
    setShow: setShowAlert,
  };
  const { handleSubmit } = hookFormProps;

  return (
    <div className="grid grid-cols-1 px-4 py-16 max-w-7xl gap-x-8 gap-y-10 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 className="text-base font-semibold leading-7 text-black">
          Personal Information
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-400">
          Use a permanent address where you can receive mail.
        </p>
      </div>

      <form className="md:col-span-2" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div className="flex items-center col-span-full gap-x-8">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
              className="flex-none object-cover w-24 h-24 bg-gray-800 rounded-lg"
              width="100"
              height="100"
            />
            <div>
              <button
                type="button"
                className="px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-white/10 hover:bg-white/20"
              >
                Change avatar
              </button>
              <p className="mt-2 text-xs leading-5 text-gray-400">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>

          <div className="sm:col-span-3">
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

          <div className="sm:col-span-3">
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
                contextId="email"
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
              Email address
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
              htmlFor="company-name"
              className="block text-sm font-medium leading-6 text-black"
            >
              Company name
            </label>
            <div className="mt-2">
              <FormInputTextField
                id="company-name"
                name="company_name"
                contextId="company-name"
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

          <div className="col-span-full">
            <label
              htmlFor="what-do-you-do"
              className="block text-sm font-medium leading-6 text-black"
            >
              What do you do?
            </label>
            <div className="mt-2">
              <FormInputTextField
                id="what-do-you-do"
                name="what_do_you_do"
                contextId="what-do-you-do"
                placeholder="..."
                {...hookFormProps}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="what-does-your-company-do"
              className="block text-sm font-medium leading-6 text-black"
            >
              What does your company do?
            </label>
            <div className="mt-2">
              <FormInputTextField
                id="what-does-your-company-do"
                name="what_does_your_company_do"
                contextId="what-does-your-company-do"
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
      <Alert {...alertProps} />
    </div>
  );
};

export default PersonalDetails;
