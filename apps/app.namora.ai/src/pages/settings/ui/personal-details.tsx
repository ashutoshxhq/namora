import React from "react";
import Image from "next/image";

import { usePersonalDetails } from "./usePersonalDetails";
import { SettingInput } from "./SettingInput";
import { Alert } from "@/design-system/molecules/alert";

export const PersonalDetails = () => {
  const { showAlert, setShowAlert, hookFormProps }: any = usePersonalDetails();
  const { handleSubmit, onFormSubmit } = hookFormProps;

  const alertProps = {
    title: "Account/Profile",
    description: "something...",
    show: showAlert,
    setShow: setShowAlert,
  };
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
              <SettingInput
                id="first-name"
                name="first_name"
                type="text"
                autoComplete="first-name"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
              <SettingInput
                type="text"
                name="last_name"
                id="last-name"
                autoComplete="last-name"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
              <SettingInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
              <SettingInput
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                className="flex-1 shadow-none outline-transparent border-0 bg-transparent py-1.5 pl-1 text-black focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="username"
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
              <SettingInput
                type="text"
                name="company_name"
                id="company-name"
                autoComplete="company-name"
                className="flex-1 shadow-none outline-transparent border-0 bg-transparent py-1.5 pl-1 text-black focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="company name"
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
              <SettingInput
                type="text"
                name="company_position"
                id="company-position"
                autoComplete="company-position"
                className="flex-1 shadow-none outline-transparent border-0 bg-transparent py-1.5 pl-1 text-black focus:ring-0 sm:text-sm sm:leading-6"
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
              <SettingInput
                type="text"
                name="what_do_you_do"
                id="what-do-you-do"
                autoComplete="what-do-you-do"
                className="flex-1 shadow-none outline-transparent border-0 bg-transparent py-1.5 pl-1 text-black focus:ring-0 sm:text-sm sm:leading-6"
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
              <SettingInput
                type="text"
                name="what_does_your_company_do"
                id="what-does-your-company-do"
                autoComplete="what-does-your-company-do"
                className="flex-1 shadow-none outline-transparent border-0 bg-transparent py-1.5 pl-1 text-black focus:ring-0 sm:text-sm sm:leading-6"
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
