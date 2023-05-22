export const tasksFetcher = async ({
  baseURL,
  teamId,
  accessToken,
}: {
  baseURL: string;
  teamId: string;
  accessToken: string;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
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
  accessToken,
}: {
  baseURL: string;
  teamId: string;
  data: any;
  accessToken: string;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
  accessToken,
}: {
  baseURL: string;
  teamId: string;
  data: any;
  accessToken: string;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks/${data.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
  accessToken,
}: {
  baseURL: string;
  teamId: string;
  data: any;
  accessToken: string;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/tasks/${data.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const _res = await res.json();
    return _res;
  } catch (error) {
    throw error;
  }
};
