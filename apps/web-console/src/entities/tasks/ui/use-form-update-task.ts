import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useNotificationDispatch } from "@/contexts/notification";
import { QUERY_KEY_TASKS, statusOptions, typeOptions } from "../constants";
import { queryClient } from "@/react-query";
import { useUpdateTask } from "@/entities/tasks/hooks";
import { TTask } from "../types";

const taskOption = {
  id: yup.string(),
  name: yup.string(),
  type: yup.string(),
};

const schema = yup.object().shape({
  title: yup.string().required("Required"),
  description: yup.string(),
  task_type: yup.object().shape(taskOption),
  task_status: yup.object().shape(taskOption),
});

export const useFormUpdateTask = (props: any) => {
  const accessToken = props?.accessToken;
  const teamId = props?.teamId;
  const userId = props?.userId;
  const selectedTask: TTask = { ...props?.selectedTask };
  const setDialogOpen = props?.setOpen;

  const selectedTaskId = selectedTask.id;
  const selectedTaskTitle = selectedTask.title ?? "";
  const selectedTaskDescription = selectedTask.description ?? "";
  const selectedTaskStatus = selectedTask.status ?? "";
  const selectedTaskType = selectedTask.task_type ?? "";

  const selectedTaskStatusObj =
    statusOptions.find((statusObj) => statusObj.id === selectedTaskStatus) ??
    statusOptions[0];
  const selectedTaskTypeObj =
    typeOptions.find((statusObj) => statusObj.id === selectedTaskType) ??
    typeOptions[0];

  const { showNotification } = useNotificationDispatch();

  const updateTaskMutationOptions = {
    onSuccess: () => {
      showNotification({
        title: "Success",
        description: "Task updated successfully",
        status: "success",
      });
      setDialogOpen(false);
      queryClient.invalidateQueries([...QUERY_KEY_TASKS, teamId]);
      reset();
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

  const updateTaskMutation = useUpdateTask(updateTaskMutationOptions);
  const { mutate, isLoading: isUpdateTaskLoading } = updateTaskMutation;

  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        title: selectedTaskTitle,
        description: selectedTaskDescription,
        task_type: selectedTaskTypeObj,
        task_status: selectedTaskStatusObj,
      },
      resolver: yupResolver(schema),
    }),
    [
      selectedTaskTitle,
      selectedTaskDescription,
      selectedTaskTypeObj,
      selectedTaskStatusObj,
    ]
  );
  const hookFormProps = useForm(useFormObj);
  const {
    reset,
    formState: { isDirty },
  } = hookFormProps;

  useEffect(() => {
    reset({
      title: selectedTaskTitle,
      description: selectedTaskDescription,
      task_type: selectedTaskTypeObj,
      task_status: selectedTaskStatusObj,
    });
  }, [
    selectedTaskTitle,
    selectedTaskDescription,
    selectedTaskTypeObj,
    selectedTaskStatusObj,
    reset,
  ]);

  const onFormEnterSubmit: SubmitHandler<any> = (submittedFormData: any) => {
    if (isDirty) {
      mutate({
        id: selectedTaskId,
        title: submittedFormData.title,
        description: submittedFormData.description,
        task_type: submittedFormData.task_type.id,
        status: submittedFormData.task_status.id,
        teamId,
        userId,
        accessToken,
      });
    }
  };

  return {
    isUpdateTaskLoading,
    hookFormProps: { ...hookFormProps, onFormEnterSubmit },
  };
};
