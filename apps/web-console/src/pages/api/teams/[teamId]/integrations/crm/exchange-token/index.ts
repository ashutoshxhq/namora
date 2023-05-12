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
  const publicToken = "";

  const response = await getAxiosClient(accessToken).post(
    `/teams/${teamId}/integrations/crm/connections/exchange-token`,
    {
      public_token: publicToken,
    }
  );

  res.json(response?.data);
}
