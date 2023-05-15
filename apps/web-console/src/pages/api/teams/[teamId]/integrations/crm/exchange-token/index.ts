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
  const publicToken = "";

  let response;
  try {
    response = await getAxiosClient(accessToken).post(
      `/teams/${teamId}/integrations/crm/connections/exchange-token`,
      {
        public_token: publicToken,
      }
    );
    res.json(response?.data?.data);
  } catch (error: any) {
    res.json(error?.response?.data);
  }
}
