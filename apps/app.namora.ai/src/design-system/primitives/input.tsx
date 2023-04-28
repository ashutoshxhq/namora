import React from "react";

export const Input = ({
  id,
  name,
  label,
  value,
  type,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  type: string;
  placeholder: string;
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <input
          id={id}
          type={type}
          name={name}
          className="block w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
          placeholder={placeholder}
          defaultValue=""
          aria-invalid="true"
          value={value}
        />
      </div>
    </div>
  );
};
