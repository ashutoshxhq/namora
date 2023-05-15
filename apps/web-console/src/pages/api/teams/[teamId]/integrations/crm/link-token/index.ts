import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "@/auth0";
import { getAxiosClient } from "@/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {});
  const accessToken = data?.accessToken ?? "";
  const { query, body } = req;
  const teamId = query.teamId;

  let response;
  try {
    response = await getAxiosClient(accessToken).post(
      `/teams/${teamId}/integrations/crm/connections/link-token`
    );
    res.json(response);
  } catch (error: any) {
    res.json(error);
  }
}
