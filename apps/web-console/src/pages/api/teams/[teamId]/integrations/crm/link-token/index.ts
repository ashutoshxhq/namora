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
  const { query, method } = req;
  const teamId = query.teamId;

  try {
    if (method === "POST") {
      const response = await getAxiosClient(accessToken).post(
        `/teams/${teamId}/integrations/crm/link-token`
      );
      const status = response?.status;
      res.status(status).json(response?.data);
    }
  } catch (error: any) {
    const status = error?.response?.status;
    res.status(status).json(error?.response);
  }
})
