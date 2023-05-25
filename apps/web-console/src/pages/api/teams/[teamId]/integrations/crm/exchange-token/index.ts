import { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken, withApiAuthRequired } from "@/auth0";
import { getAxiosClient } from "@/axios";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getAccessToken(req, res, {
    refresh: true,
});
  const accessToken = data?.accessToken ?? "";
  const { query, body } = req;
  const teamId = query.teamId;

  try {
    const response = await getAxiosClient(accessToken).post(
      `/teams/${teamId}/integrations/crm/exchange-token`,
      {
        ...JSON.parse(body),
      }
    );
    const status = response?.status;
    res.status(status).json(response?.data);
  } catch (error: any) {
    const status = error?.status;
    res.status(status).json(error);
  }
});
