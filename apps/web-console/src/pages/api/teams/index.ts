import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken, getSession } from "@/auth0";
import { getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const session = await getSession(req, res);

  const accessToken = data?.accessToken ?? "";
  const teamId = session?.user?.namora_team_id;

  const response = await getAxiosClient(accessToken).get(`/teams/${teamId}`);
  res.json(response?.data?.data);
}
