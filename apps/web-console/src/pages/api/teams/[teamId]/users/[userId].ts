import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "@/auth0";
import { AxiosError, AxiosResponse, getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const accessToken = data?.accessToken ?? "";
  const { query, method, body } = req;
  const teamId = query.teamId;
  const userId = query.userId;

  try {
    let response: AxiosResponse;
    if (method === "GET") {
      response = await getAxiosClient(accessToken).get(
        `/teams/${teamId}/users/${userId}`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    } else if (method === "PATCH") {
      response = await getAxiosClient(accessToken).patch(
        `/teams/${teamId}/users/${userId}`,
        {
          ...body,
        }
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    }
  } catch (error: any) {
    const status = error?.status;
    res.status(status).json(error);
  }
}
