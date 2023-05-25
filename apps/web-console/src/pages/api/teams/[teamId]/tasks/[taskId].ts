import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken, withApiAuthRequired } from "@/auth0";
import { AxiosResponse, getAxiosClient } from "@/axios";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {
    refresh: true,
});
  const accessToken = data?.accessToken ?? "";
  const { query, method, body } = req;
  const teamId = query.teamId;
  const taskId = query.taskId;

  try {
    if (method === "GET") {
      const response: AxiosResponse = await getAxiosClient(accessToken).get(
        `/teams/${teamId}/tasks/${taskId}`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    } else if (method === "PATCH") {
      const response: AxiosResponse = await getAxiosClient(accessToken).patch(
        `/teams/${teamId}/tasks/${taskId}`,
        {
          ...JSON.parse(body),
        }
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    } else if (method === "DELETE") {
      const response: AxiosResponse = await getAxiosClient(accessToken).delete(
        `/teams/${teamId}/tasks/${taskId}`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    }
  } catch (error: any) {
    const status = error?.response?.status;
    res.status(status).json(error?.response);
  }
});
