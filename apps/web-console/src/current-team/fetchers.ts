export const teamsFetcher = async ({
  baseURL,
  teamId,
  accessToken,
}: {
  baseURL: string;
  teamId: string;
  accessToken: string;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const teams = await res.json();
    return teams;
  } catch (error) {
    throw error;
  }
};

export const teamUsersFetcher = async ({
  baseURL,
  teamId,
  accessToken,
}: {
  baseURL: string;
  teamId: string;
  accessToken: string;
}) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const teamUsers = await res.json();
    return teamUsers;
  } catch (error) {
    throw error;
  }
};
