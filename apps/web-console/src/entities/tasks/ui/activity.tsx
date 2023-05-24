import { classNames } from "@/utils";
import { getDateWithoutYearFormat } from "@/utils/date";
import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React from "react";

const now = new Date();
const timeline = [
  {
    id: 1,
    content: "Updated to",
    target: "Waiting On",
    href: "#",
    date: "Sep 20",
    datetime: now,
    icon: UserIcon,
    iconBackground: "bg-gray-400",
  },
  {
    id: 2,
    content: "Updated to",
    target: "B",
    href: "#",
    date: "Sep 22",
    datetime: now,
    icon: HandThumbUpIcon,
    iconBackground: "bg-indigo-600",
  },
  {
    id: 3,
    content: "Updated to",
    target: "ALL",
    href: "#",
    date: "Sep 28",
    datetime: now,
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
];

export const Activity = () => {
  return (
    <div className="flow-root p-6 overflow-auto">
      <div className="">
        <ul role="list">
          {timeline.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8 ">
                {eventIdx !== timeline.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3 ">
                  <div className="flex items-center ">
                    <span
                      className={classNames(
                        event.iconBackground,
                        "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                      )}
                    >
                      <event.icon
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  {/* <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5"> */}
                  <div className="flex justify-between flex-1 min-w-0 p-4 space-x-4 shadow bg-gray-50 sm:rounded-md">
                    <div>
                      <div className="text-sm text-gray-500">
                        {event.content}{" "}
                        <a
                          href={event.href}
                          className="font-medium text-gray-900"
                        >
                          {event.target}
                        </a>
                      </div>
                    </div>
                    <div className="text-sm text-right text-gray-500 whitespace-nowrap">
                      {getDateWithoutYearFormat(event.datetime)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
