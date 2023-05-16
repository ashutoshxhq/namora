import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "@/auth0";
import { AxiosResponse, getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const accessToken = data?.accessToken ?? "";
  const { query } = req;
  const teamId = query.teamId;

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
