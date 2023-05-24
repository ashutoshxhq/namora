import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

import { NamoraDialog } from "@/design-system/molecules";
import { useGetTasks } from "@/entities/tasks/hooks";

import { FormCreateTask } from "@/entities/tasks/ui/form-create-task";
import { TTask } from "@/entities/tasks/types";
import { ListItem } from "@/entities/tasks/ui/list-item";
import { sortByCreatedAt } from "@/utils/date";
import { EmptyState } from "@/entities/tasks/ui/empty-state";

export const All = (props: any) => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { data = [] } = useGetTasks(props);
  const tasks: TTask[] = data?.data ?? [];

  const areTasksAvailable = !!tasks.length;

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

  const createTaskButton = (
    <button
      type="button"
      className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={handleClickOnCreateTask}
    >
      <PlusIcon className="w-5 h-5 mr-1" aria-hidden="true" />
      Create Task
    </button>
  );

  let renderTaskHolder = (
    <>
      <EmptyState>{createTaskButton}</EmptyState>
    </>
  );
  if (areTasksAvailable) {
    renderTaskHolder = (
      <div className="overflow-auto h-[calc(100vh_-_160px)]">
        <ul role="list" className="divide-y divide-gray-100">
          {[...tasks].sort(sortByCreatedAt).map((task: TTask) => {
            const taskId = task.id;
            return <ListItem key={taskId} task={task} {...props} />;
          })}
        </ul>
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center justify-center pb-3">
        <h3 className="flex-grow text-xl font-semibold leading-6 text-gray-900">
          All Tasks
        </h3>
        <div className={`${areTasksAvailable ? "" : "hidden"}`}>
          {createTaskButton}
        </div>
        {/* <p className="mt-1 text-xs text-gray-500">...</p> */}
      </div>
      <div className="bg-white rounded-md shadow">
        {/* <div className="p-3 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Filters
          </h3>
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Sort
          </h3>
        </div> */}
        {renderTaskHolder}
        <NamoraDialog {...createTaskDialogProps}>
          <FormCreateTask {...props} {...createTaskDialogProps} />
        </NamoraDialog>
      </div>
    </>
  );
};
