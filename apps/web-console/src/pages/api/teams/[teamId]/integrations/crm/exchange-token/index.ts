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

  try {
    const response = await getAxiosClient(accessToken).post(
      `/teams/${teamId}/integrations/crm/connections/exchange-token`,
      {
        public_token: publicToken,
      }
    );
    const status = response?.status;
    res.status(status).json(response?.data);
  } catch (error: any) {
    const status = error?.status;
    res.status(status).json(error);
  }
}
