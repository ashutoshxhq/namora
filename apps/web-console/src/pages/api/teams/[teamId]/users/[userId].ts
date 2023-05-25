import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken, withApiAuthRequired } from "@/auth0";
import { AxiosError, AxiosResponse, getAxiosClient } from "@/axios";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const accessToken = data?.accessToken ?? "";
  const { query, method, body } = req;
  const teamId = query.teamId;
  const userId = query.userId;

  try {
    if (method === "GET") {
      const response: AxiosResponse = await getAxiosClient(accessToken).get(
        `/teams/${teamId}/users/${userId}`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    } else if (method === "PATCH") {
      const response: AxiosResponse = await getAxiosClient(accessToken).patch(
        `/teams/${teamId}/users/${userId}`,
        {
          ...JSON.parse(body),
        }
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    }
  } catch (error: any) {
    const status = error?.status;
    res.status(status).json(error);
  }
});
