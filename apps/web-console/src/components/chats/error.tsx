import React from "react";
import {
  ArrowPathRoundedSquareIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

export const Error = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center">
        <div className="flex-shrink-0">
          <XCircleIcon className="w-10 h-10 text-red-400" aria-hidden="true" />
        </div>
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-xl font-medium text-red-800">
            <p>Something went wrong</p>
          </h2>
          <p className="text-sm font-medium text-red-600">
            Try reloading the page
          </p>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => router.reload()}
          >
            <ArrowPathRoundedSquareIcon
              className="-ml-0.5 mr-1.5 h-5 w-5"
              aria-hidden="true"
            />
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};
