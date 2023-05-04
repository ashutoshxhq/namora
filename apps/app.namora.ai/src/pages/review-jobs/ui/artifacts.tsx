import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@/heroicons";

import { classNames } from "@/utils";
import { NamoraPanel } from "@/design-system/molecules";

const statuses: { [key: string]: string } = {
  Complete: "text-green-700 bg-green-50 ring-green-600/20",
  "In progress": "text-gray-600 bg-gray-50 ring-gray-500/10",
  Archived: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
};
const projects = [
  {
    id: 1,
    name: "A",
    href: `#`,
    status: "Complete",
    createdBy: "Leslie Alexander",
    dueDate: "March 17, 2023",
    dueDateTime: "2023-03-17T00:00Z",
  },
  {
    id: 2,
    name: "B",
    href: `#`,
    status: "In progress",
    createdBy: "Leslie Alexander",
    dueDate: "May 5, 2023",
    dueDateTime: "2023-05-05T00:00Z",
  },
];

const Artifact = () => {
  const [open, setOpen] = useState(false);

  const panelProps = {
    open,
    data: {},
    setOpen,
  };

  const handleClickOnReview = () => {
    setOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-100">
          {projects.map((project) => (
            <li
              key={project.id}
              className="z-0 flex items-center justify-between px-4 py-5 sm:px-6 gap-x-6"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {project.name}
                  </p>
                  <p
                    className={classNames(
                      statuses[project.status],
                      "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                    )}
                  >
                    {project.status}
                  </p>
                </div>
                <div className="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
                  <p className="whitespace-nowrap">
                    Due on{" "}
                    <time dateTime={project.dueDateTime}>
                      {project.dueDate}
                    </time>
                  </p>
                  <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <p className="truncate">Created by {project.createdBy}</p>
                </div>
              </div>
              <div className="flex items-center flex-none gap-x-4">
                <button
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                  onClick={handleClickOnReview}
                >
                  Review artifact
                  <span className="sr-only">, {project.name}</span>
                </button>
                <Menu as="div" className="relative flex-none">
                  <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                    <span className="sr-only">Open options</span>
                    <EllipsisVerticalIcon
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute z-10 w-32 py-2 mt-2 origin-top-right bg-white rounded-md shadow-lg right-10 ring-1 ring-gray-900/5 focus:outline-none -top-9">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Edit
                            <span className="sr-only">, {project.name}</span>
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Delete
                            <span className="sr-only">, {project.name}</span>
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </li>
          ))}
        </ul>
        <NamoraPanel {...panelProps} />
      </div>
    </>
  );
};

export default Artifact;
