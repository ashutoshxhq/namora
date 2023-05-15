import React from "react";

import { Control, Controller, UseControllerProps } from "react-hook-form";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export const FormInputEmailField = ({
  id = "",
  name = "",
  label = "",
  contextId = "",
  placeholder = "Enter a text",
  control,
  formState,
}: {
  id: string;
  name: string;
  label?: string;
  contextId: string;
  placeholder: string;
  control: Control;
  formState: { errors: any };
}) => {
  const errName = formState?.errors?.[name];
  const errType = errName?.type;
  const errMessage = errName?.message;
  const isError = !!(errType && errMessage);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <div className="relative rounded-md shadow-sm">
            <input
              id={id}
              type="email"
              className={`${
                isError
                  ? "block w-full rounded-md border-0 px-1.5 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-1 focus:ring-inset focus:outline-0 focus:ring-red-500 sm:text-sm sm:leading-6"
                  : "block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:outline-0 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              }`}
              placeholder={errMessage || placeholder}
              {...field}
            />
            <div
              className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
                isError ? "" : "hidden"
              }`}
            >
              <ExclamationCircleIcon
                className="w-5 h-5 text-red-400"
                aria-hidden="true"
              />
            </div>
          </div>
        );
      }}
    />
  );
};
