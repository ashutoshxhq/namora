import { AxiosError, AxiosResponse } from "@/axios";

export type TVesselCRMConnection = {
  connectionId: string;
  createdTime: string;
  integrationId: string;
  lastActivityDate: string;
  nativeOrgId: string;
  nativeOrgURL: string;
  status: string;
};

export type TMutationOptionProps = {
  onSuccess: (data: AxiosResponse) => void;
  onError: (error: AxiosError) => void;
};
