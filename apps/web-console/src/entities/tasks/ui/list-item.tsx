import React, { Fragment } from "react";

import { classNames } from "@/utils";
import { TTask } from "@/entities/tasks/types";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import {
  statusIconMap,
  statusOptions,
  typeIconMap,
  typeOptions,
} from "@/entities/tasks/constants";
import { NamoraDialog, NamoraPanel } from "@/design-system/molecules";
import { FormUpdateTask } from "@/entities/tasks/ui/form-update-task";
import { FormInputSelectWithSubmit } from "@/design-system/form/select";
import { useListItem } from "./use-list-item";
import { TTeamMember } from "@/current-team/types";
import { userObjIconMap } from "@/current-user/constants";
import { Activity } from "@/entities/tasks/ui/activity";
import { OptionMenu } from "./option-menu";

export const ListItem = ({
  task,
  ...props
}: {
  task: TTask & { team_id: string };
  teamId: string;
  userId: string;
  accessToken: string;
  teamUsers: TTeamMember[];
}) => {
  const selectedTask: TTask = { ...task };
  const selectedTaskId: string = task.id;
  const selectedTaskTitle: string = task.title;
  const selectedTaskDescription: string = task.description;

  const {
    userOptions,
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
      <li className="flex items-center justify-between px-6 py-5 border-b ">
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
            <FormInputSelectWithSubmit
              id="task_user"
              name="task_user"
              contextId="task_user"
              placeholder="Choose a assignee"
              options={userOptions}
              iconMap={userObjIconMap}
              {...hookFormProps}
            />
          </div>
        </form>
        <div className="ml-2">
          <OptionMenu>
            <>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleClickOnItemName(selectedTaskId)}
                    className={classNames(
                      "w-full text-left",
                      active ? "bg-gray-100" : "",
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
            </>
          </OptionMenu>
        </div>
      </li>
      <NamoraPanel {...panelProps}>
        <div className="relative flex-1 px-4">
          <FormUpdateTask
            {...props}
            {...panelProps}
            selectedTask={selectedTask}
          />
          <Activity />
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
