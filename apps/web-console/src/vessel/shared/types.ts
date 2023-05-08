import { AxiosError } from "axios";

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
  onSuccess: (data: any) => void;
  onError: (error: AxiosError) => void;
};
