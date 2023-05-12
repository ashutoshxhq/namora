import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "@/auth0";
import { getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const accessToken = data?.accessToken ?? "";
  const { query } = req;
  const teamId = query.teamId;

  const response = await getAxiosClient(accessToken).get(
    `/teams/${teamId}/users`
  );
  res.json(response?.data?.data);
}
