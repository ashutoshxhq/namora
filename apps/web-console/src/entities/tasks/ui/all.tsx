import { useState } from "react";

import { NamoraDialog } from "@/design-system/molecules";
import { useGetTasks } from "@/entities/tasks/hooks";

import { FormCreateTask } from "./form-create-task";
import { TTask } from "../types";
import { ListItem } from "./list-item";

export const All = (props: any) => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { data = [] } = useGetTasks(props);
  const tasks: TTask[] = data?.data;

  const handleClickOnCreateTask = () => {
    setCreateTaskOpen(true);
  };

  const closeCreateTaskDialog = () => {
    setCreateTaskOpen(false);
  };

  const createTaskDialogProps = {
    open: createTaskOpen,
    setOpen: setCreateTaskOpen,
    closeDialog: closeCreateTaskDialog,
  };

  return (
    <>
      <div className="flex items-center justify-center pb-3 border-b">
        <h3 className="flex-grow text-xl font-semibold leading-6 text-gray-900">
          Tasks
        </h3>
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleClickOnCreateTask}
        >
          Create Task
        </button>
        {/* <p className="mt-1 text-xs text-gray-500">...</p> */}
      </div>
      <div className="my-3 bg-white rounded-md shadow mb-11">
        <div className="p-3 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Filters
          </h3>
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Sort
          </h3>
        </div>
        <ul role="list" className="divide-y divide-gray-100">
          {tasks.map((task: TTask) => {
            const taskId = task.id;
            return <ListItem key={taskId} task={task} {...props} />;
          })}
        </ul>
        <NamoraDialog {...createTaskDialogProps}>
          <FormCreateTask {...props} {...createTaskDialogProps} />
        </NamoraDialog>
      </div>
    </>
  );
};
