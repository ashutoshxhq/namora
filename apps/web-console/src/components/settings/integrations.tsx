import React from "react";
import { Switch } from "@headlessui/react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import { useVesselCRMIntegration } from "@/hooks/settings/useVesselCRMIntegration";
import { ButtonLoader } from "@/design-system/molecules/button-loader";

const statuses = {
  Connected: "text-green-700 bg-green-50 ring-green-600/20",
  Disconnected: "text-red-700 bg-red-50 ring-red-600/10",
};

export const Integrations = (props: any) => {
  const {
    isCRMConnected,
    connectionStatus,
    isConnectionLoading,
    handleClickOnConnect,
    handleClickOnDisconnect,
  } = useVesselCRMIntegration(props);

  const handleClickOnConnectionChange = (checked: boolean) => {
    if (checked) {
      handleClickOnConnect();
    } else {
      handleClickOnDisconnect();
    }
  };

  return (
    <div className="py-3">
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] xl:gap-x-8"
      >
        <div
          className={`overflow-hidden border border-gray-200 bg-neutral-50 rounded-xl bg-gradient-to-r from-indigo-50 ${
            isCRMConnected ? "to-green-50" : "to-red-50"
          }`}
        >
          <div className="relative flex items-center justify-between p-6 bg-white border-b gap-x-4 border-gray-900/2">
            <div className="flex items-center gap-x-4">
              <div className="p-2 border rounded-lg">
                <UserGroupIcon
                  className="w-8 h-8 text-black-400"
                  aria-hidden="true"
                />
              </div>
              <p className="text-lg font-semibold leading-6 text-gray-900">
                CRM
              </p>
            </div>
            <Switch
              checked={isCRMConnected}
              onChange={handleClickOnConnectionChange}
              className={`${
                isCRMConnected ? "bg-indigo-600" : "bg-gray-200"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out `}
            >
              <span
                className={`${
                  isCRMConnected ? "translate-x-5" : "translate-x-0"
                } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              >
                <span
                  className={`${
                    isCRMConnected
                      ? "opacity-100 duration-200 ease-in"
                      : "opacity-0 duration-100 ease-out"
                  } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                  aria-hidden="true"
                >
                  <ButtonLoader
                    isLoading={isConnectionLoading}
                    color="#4F46E5"
                  />
                </span>
              </span>
            </Switch>
          </div>
          <div className="px-6 py-4 -my-3 text-sm leading-6 divide-y divide-gray-100 ">
            <div className="flex justify-between py-3 gap-x-4 ">
              <dt className="text-gray-500">Status</dt>
              <div className="flex items-center gap-x-2">
                <div
                  className={`${
                    statuses["Connected"]
                  } rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset ${
                    isCRMConnected ? "" : "hidden"
                  }`}
                >
                  <p className="text-xs font-medium text-green-700 capitalize">{`${connectionStatus?.toLocaleLowerCase()}`}</p>
                </div>
                <div
                  className={`${
                    statuses["Connected"]
                  } rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset ${
                    isCRMConnected ? "" : "hidden"
                  }`}
                >
                  <p className="font-medium text-green-700">Connected</p>
                </div>
                <div
                  className={`${
                    statuses["Disconnected"]
                  } rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset ${
                    isCRMConnected ? "hidden" : ""
                  }`}
                >
                  <p className="font-medium text-red-700">Disconnected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ul>
    </div>
  );
};
