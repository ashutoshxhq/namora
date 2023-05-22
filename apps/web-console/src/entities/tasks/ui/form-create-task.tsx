import React, { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";

import { FormInputTextField } from "@/design-system/form";
import { ButtonLoader } from "@/design-system/molecules/button-loader";
import {
  statusIconMap,
  statusOptions,
  typeIconMap,
  typeOptions,
} from "@/entities/tasks/constants";
import { FormInputSelect } from "@/design-system/form/select";
import { useFormCreateTask } from "./use-form-create-task";
import { FormInputTextAreaField } from "@/design-system/form/textarea";

export const FormCreateTask = (props: {
  accessToken: string;
  teamId: string;
  userId: string;
  setOpen: (value: boolean) => void;
}) => {
  const disabled = "opacity-50 cursor-not-allowed";

  const { hookFormProps, isCreateTaskLoading = false } =
    useFormCreateTask(props);
  const { handleSubmit, onFormEnterSubmit, formState } = hookFormProps;

  const { isDirty } = formState;

  return (
    <>
      <form onSubmit={handleSubmit(onFormEnterSubmit)}>
        <div className="relative flex flex-col w-full gap-2">
          <p className="text-base font-semibold text-gray-900">Create Task</p>
          <div className="col-span-full">
            <FormInputTextField
              id="title"
              name="title"
              contextId="task_title"
              placeholder="Task title"
              {...hookFormProps}
            />
          </div>
          <div className="col-span-full">
            <FormInputTextAreaField
              id="description"
              name="description"
              contextId="description"
              placeholder="Add description"
              {...hookFormProps}
            />
          </div>
          <div className="flex">
            <div className="flex flex-grow gap-2">
              <FormInputSelect
                id="task_status"
                name="task_status"
                contextId="task_status"
                placeholder="Choose a task status"
                options={statusOptions}
                iconMap={statusIconMap}
                {...hookFormProps}
              />

              <FormInputSelect
                id="task_type"
                name="task_type"
                contextId="task_type"
                placeholder="Choose a task type"
                options={typeOptions}
                iconMap={typeIconMap}
                {...hookFormProps}
              />
            </div>
            <button
              type="submit"
              className={`relative flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
            ${!isDirty || isCreateTaskLoading ? disabled : ""}
            `}
              disabled={!isDirty || isCreateTaskLoading}
            >
              <ButtonLoader isLoading={isCreateTaskLoading} />
              Save
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
