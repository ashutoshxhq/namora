import { getAxiosClient } from "@/axios";

export const getTeam = async ({
  accessToken,
  teamId,
}: {
  accessToken: string;
  teamId: string;
}) => {
  try {
    if (!accessToken && !teamId) return null;
    const response = await getAxiosClient(accessToken).get(
      `https://engine.svc.api.namora.ai/teams/${teamId}`
    );
    return response?.data ?? [];
  } catch (err) {
    throw err;
  }
};
