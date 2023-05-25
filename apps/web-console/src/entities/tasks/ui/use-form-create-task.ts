import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useNotificationDispatch } from "@/contexts/notification";
import {
  OptionType,
  QUERY_KEY_TASKS,
  statusOptions,
  typeOptions,
} from "../constants";
import { queryClient } from "@/react-query";
import { useCreateTask } from "@/entities/tasks/hooks";
import { getUserDataInGroupByType } from "@/current-user/utils";

const taskOption = {
  id: yup.string(),
  name: yup.string(),
  type: yup.string(),
};

const schema = yup.object().shape({
  title: yup.string().required("Task title is Required"),
  description: yup.string(),
  task_type: yup.object().shape(taskOption),
  task_status: yup.object().shape(taskOption),
  task_user: yup.object().shape(taskOption),
});

export const useFormCreateTask = (props: any) => {
  const teamId = props?.teamId;
  const userId = props?.userId;
  const setDialogOpen = props.setOpen;

  const taskTitle = "";
  const taskDescription = "";

  const selectedTaskStatus = statusOptions[0];
  const selectedTaskType = typeOptions[0];

  const teamUsers = props?.teamUsers;
  const userOptions = getUserDataInGroupByType(teamUsers);
  const selectedTaskUser = useMemo(() => {}, []);

  const { showNotification } = useNotificationDispatch();

  const createTaskMutationOptions = {
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

  const updateTeamMemberMutation = useCreateTask(createTaskMutationOptions);
  const { mutate, isLoading: isCreateTaskLoading } = updateTeamMemberMutation;

  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        title: taskTitle,
        description: taskDescription,
        task_type: selectedTaskType,
        task_status: selectedTaskStatus,
        task_user: selectedTaskUser,
      },
      resolver: yupResolver(schema),
    }),
    [
      taskTitle,
      taskDescription,
      selectedTaskStatus,
      selectedTaskType,
      selectedTaskUser,
    ]
  );
  const hookFormProps = useForm(useFormObj);
  const {
    reset,
    formState: { isDirty },
  } = hookFormProps;

  useEffect(() => {
    reset({
      title: taskTitle,
      description: taskDescription,
      task_type: selectedTaskType,
      task_status: selectedTaskStatus,
      task_user: selectedTaskUser,
    });
  }, [
    taskTitle,
    taskDescription,
    selectedTaskStatus,
    selectedTaskType,
    selectedTaskUser,
    reset,
  ]);

  const onFormEnterSubmit: SubmitHandler<any> = (submittedFormData: any) => {
    if (isDirty) {
      mutate({
        title: submittedFormData.title,
        description: submittedFormData.description,
        task_type: submittedFormData.task_type.id,
        status: submittedFormData.task_status.id,
        teamId,
        userId,
      });
    }
  };
  return {
    userOptions,
    isCreateTaskLoading,
    hookFormProps: { ...hookFormProps, onFormEnterSubmit },
  };
};
