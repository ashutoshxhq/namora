import React from "react";
import { InboxStackIcon } from "@heroicons/react/24/outline";

export const EmptyState = ({ children }: any) => {
  return (
    <div className="relative flex flex-col items-center justify-center  w-full  p-12 text-center rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-auto h-[calc(100vh_-_160px)]">
      <InboxStackIcon className="w-10" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No tasks</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new task.
      </p>
      <div className="py-2">{children}</div>
    </div>
  );
};
