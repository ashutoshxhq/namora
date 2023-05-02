import React from "react";
import { usePassword } from "settings/ui/usePassword";
import { SettingInput } from "settings/ui/SettingInput";

export const Password = () => {
  const { hookFormProps }: any = usePassword();
  const { handleSubmit, onFormSubmit } = hookFormProps;
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
              <SettingInput
                id="current-password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
              <SettingInput
                id="new-password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
              <SettingInput
                id="confirm-password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
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
