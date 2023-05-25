import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken, getSession, withApiAuthRequired } from "@/auth0";
import { AxiosResponse, getAxiosClient } from "@/axios";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken = "" } = await getAccessToken(req, res, {
    refresh: true,
  });
  const session = await getSession(req, res);

  const teamId = session?.user?.namora_team_id;

  try {
    const response: AxiosResponse = await getAxiosClient(accessToken).get(
      `/teams/${teamId}`
    );
    const status = response?.status;
    res.status(status).json(response?.data);
  } catch (error: any) {
    const status = error?.status;
    res.status(status).json(error);
  }
});
