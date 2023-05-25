import { useMutation, useQuery } from "@/react-query";
import {
  createTaskFetcher,
  tasksFetcher,
  updateTaskFetcher,
  deleteTaskFetcher,
} from "@/entities/tasks/fetchers";
import { QUERY_KEY_TASKS } from "@/entities/tasks/constants";
import { TTask } from "../types";

type TMutationOptionProps = {
  onSuccess: () => void;
  onError: () => void;
};

export const useGetTasks = (props: any) => {
  const teamId = props?.teamId;
  const tasks = props?.tasks;

  const { data, isLoading, isFetched } = useQuery(
    [...QUERY_KEY_TASKS, teamId],
    () => tasksFetcher({ baseURL: "/api", teamId }),
    {
      initialData: tasks,
      enabled: !!teamId,
    }
  );

  return { data, isLoading, isFetched };
};

export const useCreateTask = (
  createTaskMutationOptions: TMutationOptionProps
) => {
  const createTaskMutation = useMutation(
    ({
      title,
      description,
      status,
      task_type,
      teamId,
      userId,
    }: Omit<TTask, "id"> & {
      teamId: string;
      userId: string;
    }) => {
      const data = {
        title,
        description,
        status,
        task_type,
        team_id: teamId,
        user_id: userId,
      };
      return createTaskFetcher({ baseURL: "/api", teamId, data });
    },
    createTaskMutationOptions
  );
  return createTaskMutation;
};

export const useUpdateTask = (
  updateTaskMutationOptions: TMutationOptionProps
) => {
  const updateTaskMutation = useMutation(
    ({
      id,
      title,
      description,
      status,
      task_type,
      teamId,
      userId,
    }: TTask & {
      teamId: string;
      userId: string;
    }) => {
      const data = {
        id,
        title,
        description,
        status,
        task_type,
        team_id: teamId,
        user_id: userId,
      };
      return updateTaskFetcher({ baseURL: "/api", teamId, data });
    },
    updateTaskMutationOptions
  );
  return updateTaskMutation;
};

export const useDeleteTask = (
  deleteTaskMutationOptions: TMutationOptionProps
) => {
  const deleteTaskMutation = useMutation(
    ({
      id,
      teamId,
      userId,
    }: Pick<TTask, "id"> & {
      teamId: string;
      userId: string;
    }) => {
      const data = {
        id,
        team_id: teamId,
        user_id: userId,
      };
      return deleteTaskFetcher({ baseURL: "/api", teamId, data });
    },
    deleteTaskMutationOptions
  );
  return deleteTaskMutation;
};
