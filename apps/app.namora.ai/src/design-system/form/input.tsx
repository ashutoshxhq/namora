import React from "react";

import { Controller } from "react-hook-form";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const errMsgColor: { [key: string]: string } = {
  chat_message_input: "transparent",
};

export const FormInputTextField = ({
  id = "",
  name = "",
  label = "",
  contextId = "",
  placeholder = "Enter a text",
  control,
  formState: { errors },
}: {
  id: string;
  name: string;
  label: string;
  contextId: string;
  placeholder: string;
  control: any;
  formState: { errors: any };
}) => {
  const errName = errors?.[name];
  const errType = errName?.type;
  const errMessage = errName?.message;
  const isError = !!(errType && errMessage);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <div>
            <label
              htmlFor={name}
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {label}
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id={id}
                type="text"
                className={`${
                  isError
                    ? "block w-full rounded-md border-0 px-1.5 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-1 focus:ring-inset focus:outline-0 focus:ring-red-500 sm:text-sm sm:leading-6"
                    : "block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:outline-0 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                }`}
                placeholder={errMessage || placeholder}
                defaultValue=""
                aria-invalid="true"
                {...field}
                //   aria-describedby="error-text"
              />
              <div
                className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
                  isError ? "" : "hidden"
                }`}
              >
                <ExclamationCircleIcon
                  className="w-5 h-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            {/* <p
              className={`px-1.5 text-sm text-red-600 ${
                isError ? "" : "hidden"
              }`}
              id="email-error"
            >
              {errMessage}
            </p> */}
          </div>
        );
      }}
    />
  );
};
