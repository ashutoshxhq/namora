import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken, getSession } from "@/auth0";
import { AxiosResponse, getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const session = await getSession(req, res);

  const accessToken = data?.accessToken ?? "";
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
}
