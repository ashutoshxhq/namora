export const tasksFetcher = async ({
  baseURL,
  teamId,
  init = {},
}: {
  baseURL: string;
  teamId: string;
  init?: RequestInit;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks`, init);
    const tasks = await res.json();
    return tasks;
  } catch (error) {
    throw error;
  }
};

export const createTaskFetcher = async ({
  baseURL,
  teamId,
  data,
}: {
  baseURL: string;
  teamId: string;
  data: any;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ ...data }),
    });
    const _res = await res.json();
    return _res;
  } catch (error) {
    throw error;
  }
};

export const updateTaskFetcher = async ({
  baseURL,
  teamId,
  data,
}: {
  baseURL: string;
  teamId: string;
  data: any;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...data }),
    });
    const _res = await res.json();
    return _res;
  } catch (error) {
    throw error;
  }
};

export const deleteTaskFetcher = async ({
  baseURL,
  teamId,
  data,
}: {
  baseURL: string;
  teamId: string;
  data: any;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks/${data.id}`, {
      method: "DELETE",
    });
    const _res = await res.json();
    return _res;
  } catch (error) {
    throw error;
  }
};
