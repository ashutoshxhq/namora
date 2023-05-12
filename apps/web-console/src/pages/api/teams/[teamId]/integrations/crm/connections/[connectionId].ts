import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "@/auth0";
import { getAxiosClient } from "@/axios";

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

  let response;

  if (method === "GET") {
    response = await getAxiosClient(accessToken).get(
      `/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`
    );
  } else if (method === "DELETE") {
    response = await getAxiosClient(accessToken).delete(
      `/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`
    );
  }

  res.json(response?.data);
}
