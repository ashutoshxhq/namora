import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "@/auth0";
import { AxiosResponse, getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const accessToken = data?.accessToken ?? "";
  const { query, method } = req;
  const teamId = query.teamId;
  const connectionId: string = query?.connectionId as string;
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

  try {
    if (method === "GET") {
      const response: AxiosResponse = await getAxiosClient(accessToken).get(
        `/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    } else if (method === "DELETE") {
      const response: AxiosResponse = await getAxiosClient(accessToken).delete(
        `/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    }
  } catch (error: any) {
    const status = error?.status;
    res.status(status).json(error);
  }
}
