import React, { Fragment, useState } from "react";

import { getAllFirstChars } from "@/utils/string";
import { classNames } from "@/utils";
import { TTask } from "@/entities/tasks/types";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useDeleteTask } from "@/entities/tasks/hooks";
import { QUERY_KEY_TASKS } from "@/entities/tasks/constants";
import { useNotificationDispatch } from "@/contexts/notification";
import { queryClient } from "@/react-query";
import { NamoraDialog, NamoraPanel } from "@/design-system/molecules";
import { FormUpdateTask } from "@/entities/tasks/ui/form-update-task";

export const ListItem = ({
  task,
  ...rest
}: {
  task: TTask & { team_id: string };
  teamId: string;
  userId: string;
  accessToken: string;
}) => {
  const teamId = rest.teamId;
  const selectedTask = { ...task };

  const taskId = selectedTask.id;
  const taskName = `${selectedTask.title}`;
  const taskDescription = `${selectedTask.description}`;
  const { showNotification } = useNotificationDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const deleteTaskMutationOptions = {
    onSuccess: () => {
      showNotification({
        title: "Success",
        description: "Task updated successfully",
        status: "success",
      });
      queryClient.invalidateQueries([...QUERY_KEY_TASKS, teamId]);
    },
    onError: () => {
      showNotification({
        title: "Failed",
        description: "Task update failed",
        status: "error",
      });
      queryClient.invalidateQueries([...QUERY_KEY_TASKS, teamId]);
    },
  };

  const deleteTaskMutation = useDeleteTask(deleteTaskMutationOptions);
  const { mutate, isLoading: isDeleteTaskLoading } = deleteTaskMutation;

  const handleClickOnEdit = (id: string) => {
    setDialogOpen(true);
  };

  const handleClickOnDelete = (id: string) => {
    mutate({
      id,
      ...rest,
    });
  };

  const panelProps = {
    open: panelOpen,
    setOpen: setPanelOpen,
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const updateTaskDialogProps = {
    open: dialogOpen,
    setOpen: setDialogOpen,
    closeDialog: closeDialog,
  };

  return (
    <>
      <li
        key={taskId}
        className="flex items-center justify-between py-5 just sm:px-6 gap-x-6"
      >
        <div className="flex flex-grow gap-x-4">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-500 rounded-full">
            <span className="text-sm font-medium leading-none text-white capitalize">
              {getAllFirstChars(taskName)}
            </span>
          </span>
          <div className="flex-auto min-w-0">
            <p
              className="inline text-sm font-semibold leading-6 text-gray-900 cursor-pointer"
              onClick={() => handleClickOnEdit(taskId)}
            >
              {taskName}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 ">
              {taskDescription}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end ">
          <p className="text-sm leading-6 text-gray-900">{task.status}</p>
        </div>
        <div className="flex flex-col items-end ">
          <p className="text-sm leading-6 text-gray-900">{task.task_type}</p>
        </div>
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
                      onClick={() => handleClickOnEdit(task.id)}
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
                      onClick={() => handleClickOnDelete(task.id)}
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
        <FormUpdateTask
          {...rest}
          {...updateTaskDialogProps}
          selectedTask={selectedTask}
        />
      </NamoraPanel>
      <NamoraDialog {...updateTaskDialogProps}>
        <FormUpdateTask
          {...rest}
          {...updateTaskDialogProps}
          selectedTask={selectedTask}
        />
      </NamoraDialog>
    </>
  );
};
