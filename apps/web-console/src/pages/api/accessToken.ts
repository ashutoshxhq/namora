import { getAccessToken, withApiAuthRequired } from "@/auth0";
import { NextApiRequest, NextApiResponse } from "next";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken } = await getAccessToken(req, res, {});
  res.status(200).json({ accessToken });
});
