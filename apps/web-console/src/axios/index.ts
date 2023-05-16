import axios, { GenericAbortSignal, AxiosError, AxiosResponse } from "axios";

import {
  AUTH0_BASE_URL,
  ENGINE_SERVICE_API_URL,
} from "@/axios/constants";

export const getAxiosClient = (accessToken: string) => {
  return axios.create({
    baseURL: ENGINE_SERVICE_API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getAxiosClientInternal = (accessToken: string) => {
  return axios.create({
    baseURL: AUTH0_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export { type GenericAbortSignal, type AxiosError, type AxiosResponse };
