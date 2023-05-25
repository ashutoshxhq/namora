export const teamsFetcher = async ({
  baseURL,
  teamId,
  init = {},
}: {
  baseURL: string;
  teamId: string;
  init?: RequestInit;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}`, init);
    const teams = await res.json();
    return teams;
  } catch (error) {
    throw error;
  }
};

export const teamUsersFetcher = async ({
  baseURL,
  teamId,
  init = {},
}: {
  baseURL: string;
  teamId: string;
  init?: RequestInit;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/users`, init);
    const teamUsers = await res.json();
    return teamUsers;
  } catch (error) {
    throw error;
  }
};
