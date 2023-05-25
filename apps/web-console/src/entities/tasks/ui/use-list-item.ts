import { useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SubmitHandler, useForm } from "react-hook-form";

import { useDeleteTask, useUpdateTask } from "@/entities/tasks/hooks";
import {
  QUERY_KEY_TASKS,
  statusOptions,
  typeOptions,
} from "@/entities/tasks/constants";
import { useNotificationDispatch } from "@/contexts/notification";
import { queryClient } from "@/react-query";
import { TTask } from "../types";
import { getUserDataInGroupByType } from "@/current-user/utils";

const taskOption = {
  id: yup.string(),
  name: yup.string(),
  type: yup.string(),
};

const schema = yup.object().shape({
  task_type: yup.object().shape(taskOption),
  task_status: yup.object().shape(taskOption),
  task_user: yup.object().shape(taskOption),
});

export const useListItem = (props: any) => {
  const teamId = props?.teamId;
  const userId = props?.userId;
  const selectedTask: TTask & { user_id: string } = { ...props?.selectedTask };

  const selectedTaskId = selectedTask.id;
  const selectedTaskTitle = selectedTask.title ?? "";
  const selectedTaskDescription = selectedTask.description ?? "";
  const selectedTaskStatus = selectedTask.status ?? "";
  const selectedTaskType = selectedTask.task_type ?? "";
  const selectedTaskUserId = selectedTask?.user_id;

  const selectedTaskStatusObj = statusOptions.find(
    (statusObj) => statusObj.id === selectedTaskStatus
  );
  const selectedTaskTypeObj = typeOptions.find(
    (statusObj) => statusObj.id === selectedTaskType
  );
  const teamUsers = props?.teamUsers;
  const userOptions = getUserDataInGroupByType(teamUsers);

  const selectedTaskUserObj = useMemo(() => {
    return userOptions?.find(
      (obj: { id: string }) => obj.id === selectedTaskUserId
    );
  }, [selectedTaskUserId, userOptions]);
  // const selectedTaskUserName = getFullName(selectedTaskUserObj);
  // const teamMemberToolTipText = selectedTaskUserName;

  const selectedMemberId = selectedTaskUserObj?.id;
  const selectedMemberName = selectedTaskUserObj?.name;
  const selectedMemberType = selectedTaskUserObj?.type;

  const relevantUserObj = useMemo(() => {
    const obj = {
      id: selectedMemberId,
      name: selectedMemberName,
      type: selectedMemberType,
    };
    return obj;
  }, [selectedMemberId, selectedMemberName, selectedMemberType]);

  const { showNotification } = useNotificationDispatch();

  const updateTaskAsListItemMutationOptions = {
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

  const updateTaskAsListItemMutation = useUpdateTask(
    updateTaskAsListItemMutationOptions
  );
  const { mutate: updateTaskAsListItemMutate, isLoading: isUpdateTaskLoading } =
    updateTaskAsListItemMutation;

  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        title: selectedTaskTitle,
        description: selectedTaskDescription,
        task_type: selectedTaskTypeObj,
        task_status: selectedTaskStatusObj,
        task_user: relevantUserObj,
      },
      resolver: yupResolver(schema),
    }),
    [
      selectedTaskTitle,
      selectedTaskDescription,
      selectedTaskTypeObj,
      selectedTaskStatusObj,
      relevantUserObj,
    ]
  );
  const hookFormProps = useForm(useFormObj);
  const { reset } = hookFormProps;

  useEffect(() => {
    reset({
      title: selectedTaskTitle,
      description: selectedTaskDescription,
      task_type: selectedTaskTypeObj,
      task_status: selectedTaskStatusObj,
      task_user: relevantUserObj,
    });
  }, [
    selectedTaskTitle,
    selectedTaskDescription,
    selectedTaskTypeObj,
    selectedTaskStatusObj,
    relevantUserObj,
    reset,
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const deleteTaskMutationOptions = {
    onSuccess: () => {
      showNotification({
        title: "Success",
        description: "Task deleted successfully",
        status: "success",
      });
      queryClient.invalidateQueries([...QUERY_KEY_TASKS, teamId]);
    },
    onError: () => {
      showNotification({
        title: "Failed",
        description: "Task delete failed",
        status: "error",
      });
      queryClient.invalidateQueries([...QUERY_KEY_TASKS, teamId]);
    },
  };

  const deleteTaskAsListItemMutation = useDeleteTask(deleteTaskMutationOptions);
  const { mutate: deleteTaskAsListItemMutate, isLoading: isDeleteTaskLoading } =
    deleteTaskAsListItemMutation;

  const handleClickOnDelete = (id: string) => {
    deleteTaskAsListItemMutate({
      id,
      ...props,
    });
  };
  const handleClickOnItemName = (id: string) => {
    setDialogOpen(true);
  };

  const handleClickOnEdit = (id: string) => {
    setPanelOpen(true);
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

  // function getRelevantUserId(submittedFormData: any) {
  //   const submittedFormUserId = submittedFormData?.task_user?.id;
  //   const isUnassigned = submittedFormUserId === unassignedObj.id;

  //   const userId = isUnassigned ? null : submittedFormUserId;
  //   return userId;
  // }

  const onFormSubmit: SubmitHandler<any> = (submittedFormData: any) => {
    // const userId = getRelevantUserId(submittedFormData);
    const userId = submittedFormData?.task_user?.id;
    updateTaskAsListItemMutate({
      id: selectedTaskId,
      title: submittedFormData.title,
      description: submittedFormData.description,
      task_type: submittedFormData.task_type.id,
      status: submittedFormData.task_status.id,
      teamId,
      userId,
    });
  };

  return {
    userOptions,
    panelProps,
    updateTaskDialogProps,
    handleClickOnEdit,
    handleClickOnItemName,
    handleClickOnDelete,
    hookFormProps: { ...hookFormProps, onFormSubmit },
  };
};
