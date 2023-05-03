import { Switch } from "@headlessui/react";
import React, { useState } from "react";
import Image from "next/image";

import { classNames } from "@/utils";

const statuses = {
  Connected: "text-green-700 bg-green-50 ring-green-600/20",
  Disconnected: "text-red-700 bg-red-50 ring-red-600/10",
};
const clients = [
  {
    id: 1,
    name: "Tuple",
    imageUrl: "https://tailwindui.com/img/logos/48x48/tuple.svg",
    lastInvoice: {
      date: "December 13, 2022",
      dateTime: "2022-12-13",
      amount: "$2,000.00",
      status: "Overdue",
    },
  },
  {
    id: 2,
    name: "SavvyCal",
    imageUrl: "https://tailwindui.com/img/logos/48x48/savvycal.svg",
    lastInvoice: {
      date: "January 22, 2023",
      dateTime: "2023-01-22",
      amount: "$14,000.00",
      status: "Paid",
    },
  },
  {
    id: 3,
    name: "Reform",
    imageUrl: "https://tailwindui.com/img/logos/48x48/reform.svg",
    lastInvoice: {
      date: "January 23, 2023",
      dateTime: "2023-01-23",
      amount: "$7,600.00",
      status: "Paid",
    },
  },
];

const Integrations = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="py-3">
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] xl:gap-x-8"
      >
        {clients.map((client) => (
          <li
            key={client.id}
            className="overflow-hidden border border-gray-200 rounded-xl"
          >
            <div className="flex items-center justify-between p-6 bg-white border-b gap-x-4 border-gray-900/2">
              <div className="flex items-center gap-x-4">
                <Image
                  src={client.imageUrl}
                  alt={client.name}
                  width="100"
                  height="100"
                  className="flex-none object-cover w-12 h-12 bg-white rounded-lg ring-1 ring-gray-900/10"
                />
                <div className="text-sm font-medium leading-6 text-gray-900">
                  {client.name}
                </div>
              </div>
              <Switch
                checked={enabled}
                onChange={setEnabled}
                className={classNames(
                  enabled ? "bg-indigo-600" : "bg-gray-200",
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  className={classNames(
                    enabled ? "translate-x-5" : "translate-x-0",
                    "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  )}
                >
                  <span
                    className={classNames(
                      enabled
                        ? "opacity-0 duration-100 ease-out"
                        : "opacity-100 duration-200 ease-in",
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={classNames(
                      enabled
                        ? "opacity-100 duration-200 ease-in"
                        : "opacity-0 duration-100 ease-out",
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      className="w-3 h-3 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </Switch>
            </div>
            <div className="px-6 py-4 -my-3 text-sm leading-6 divide-y divide-gray-100 ">
              <div className="flex justify-between py-3 gap-x-4 ">
                <dt className="text-gray-500">Status</dt>
                <div className="flex items-start gap-x-2">
                  <div
                    className={classNames(
                      statuses["Connected"],
                      "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                    )}
                  >
                    Connected
                  </div>
                  <div
                    className={classNames(
                      statuses["Disconnected"],
                      "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                    )}
                  >
                    Disconnected
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Integrations;
