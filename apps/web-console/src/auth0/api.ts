import { getAxiosClient } from "@/axios";
import { API_ACCESS_TOKEN } from "@/auth0/constants";

export const getAccessToken = async (url: string = API_ACCESS_TOKEN) => {
  try {
    if (!url) return null;
    const response = await getAxiosClient()
      .get(url)
      .then((res) => res.data);
    return response?.accessToken;
  } catch (err) {
    throw err;
  }
};
