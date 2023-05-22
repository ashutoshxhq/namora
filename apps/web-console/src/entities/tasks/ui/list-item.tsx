import React, { Fragment, useState } from "react";

import { getAllFirstChars } from "@/utils/string";
import { classNames } from "@/utils";
import { TTask } from "@/entities/tasks/types";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useDeleteTask } from "@/entities/tasks/hooks";
import {
  QUERY_KEY_TASKS,
  statusIconMap,
  statusOptions,
  typeIconMap,
  typeOptions,
} from "@/entities/tasks/constants";
import { NamoraDialog, NamoraPanel } from "@/design-system/molecules";
import { FormUpdateTask } from "@/entities/tasks/ui/form-update-task";
import { FormInputSelectWithSubmit } from "@/design-system/form/select";
import { useFormUpdateTask } from "./use-form-update-task";
import { useListItem } from "./use-list-item";

export const ListItem = ({
  task,
  ...props
}: {
  task: TTask & { team_id: string };
  teamId: string;
  userId: string;
  accessToken: string;
}) => {
  const selectedTask: TTask = { ...task };
  const selectedTaskId: string = task.id;
  const selectedTaskTitle: string = task.title;
  const selectedTaskDescription: string = task.description;

  const {
    panelProps,
    updateTaskDialogProps,
    hookFormProps,
    handleClickOnEdit,
    handleClickOnItemName,
    handleClickOnDelete,
  } = useListItem({
    ...props,
    selectedTask,
  });

  return (
    <>
      <li className="flex items-center justify-between px-6 py-5 ">
        <div className="flex flex-grow gap-x-4">
          <div className="flex-auto min-w-0">
            <p
              className="inline text-sm font-semibold leading-6 text-gray-900 cursor-pointer"
              onClick={() => handleClickOnEdit(selectedTaskId)}
            >
              {selectedTaskTitle}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 ">
              {selectedTaskDescription}
            </p>
          </div>
        </div>

        <form>
          <div className="flex items-center gap-2">
            <FormInputSelectWithSubmit
              id="task_status"
              name="task_status"
              contextId="task_status"
              placeholder="Choose a task status"
              options={statusOptions}
              iconMap={statusIconMap}
              {...hookFormProps}
            />
            <FormInputSelectWithSubmit
              id="task_type"
              name="task_type"
              contextId="task_type"
              placeholder="Choose a task type"
              options={typeOptions}
              iconMap={typeIconMap}
              {...hookFormProps}
            />
          </div>
        </form>

        <div className="flex items-center gap-x-6">
          <div className="hidden sm:flex sm:flex-col sm:items-end"></div>
          <Menu as="div" className="relative flex-none">
            <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
              <span className="sr-only">Open options</span>
              <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
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
              <Menu.Items className="absolute z-10 w-32 p-1 mt-2 origin-top-right bg-white rounded-md shadow-lg right-10 ring-1 ring-gray-900/5 focus:outline-none -top-5">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleClickOnItemName(selectedTaskId)}
                      className={classNames(
                        "w-full text-left",
                        active ? "bg-gray-50" : "",
                        "block px-3 py-1 text-sm leading-6 text-gray-900"
                      )}
                    >
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleClickOnDelete(selectedTaskId)}
                      className={classNames(
                        "w-full text-left",
                        active ? "bg-gray-50" : "",
                        "block px-3 py-1 text-sm leading-6 text-gray-900"
                      )}
                    >
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </li>
      <NamoraPanel {...panelProps}>
        <div className="relative flex-1 px-4">
          <FormUpdateTask
            {...props}
            {...panelProps}
            selectedTask={selectedTask}
          />
        </div>
      </NamoraPanel>
      <NamoraDialog {...updateTaskDialogProps}>
        <FormUpdateTask
          {...props}
          {...updateTaskDialogProps}
          selectedTask={selectedTask}
        />
      </NamoraDialog>
    </>
  );
};
