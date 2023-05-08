import axios, { GenericAbortSignal, AxiosError, AxiosResponse } from "axios";

import { AUTH0_BASE_URL } from "@/axios/constants";

export const getAxiosClient = (accessToken: string) => {
  return axios.create({
    baseURL: AUTH0_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    // transformRequest: [
    //   (data) => {
    //     return JSON.stringify(data);
    //   },
    // ],
    // transformResponse: [
    //   (data) => {
    //     return JSON.parse(data);
    //   },
    // ],
  });
};

export { type GenericAbortSignal, type AxiosError, type AxiosResponse };
