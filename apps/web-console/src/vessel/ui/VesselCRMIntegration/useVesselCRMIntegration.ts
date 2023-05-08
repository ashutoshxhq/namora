import { useVesselLink } from "@vesselapi/react-vessel-link";
import { useState } from "react";
import { useQueryClient } from "@/react-query";

import {
  useDisconnectVesselCRMConnection,
  useExchangeVesselCRMToken,
  useGetVesselCRMConnectionStatus,
  useLinkVesselCRMToken,
} from "@/vessel/shared/hooks";
import { QUERY_KEY_VESSEL } from "@/vessel/constants";
import { AxiosError, AxiosResponse } from "axios";

export const useVesselCRMIntegration = (props: any) => {
  console.log("useVesselCRMIntegration", { props });
  const [publicToken, setPublicToken] = useState("");
  const queryClient = useQueryClient();
  const isCRMConnected = false;

  const disconnectVesselCRMConnectionMutationOptions = {
    onSuccess: () => {
      console.log({
        title: "Success",
        description: `Disconnected`,
        status: "success",
        isClosable: true,
      });
      queryClient.invalidateQueries(QUERY_KEY_VESSEL);
    },
    onError: () => {
      console.log({
        title: "Failed",
        description: "Unable to disconnect",
        status: "error",
        isClosable: true,
      });
    },
    retry: false,
  };
  const disconnectVesselCRMConnectionMutation =
    useDisconnectVesselCRMConnection(
      disconnectVesselCRMConnectionMutationOptions
    );

  const onVesselCRMConnectionSuccess = (publicToken: string): void => {
    if (publicToken) setPublicToken(publicToken);
  };

  const { open } = useVesselLink({
    onSuccess: onVesselCRMConnectionSuccess,
  });

  const exchangeVesselCRMTokenMutationOptions = {
    onSuccess: () => {
      console.log({
        title: "Success",
        description: "Connected with CRM",
        status: "success",
        isClosable: true,
      });
      queryClient.invalidateQueries(QUERY_KEY_VESSEL);
    },
    onError: (error: AxiosError) => {
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to connect with CRM";
      console.log({
        title: "Failed",
        description: message,
        status: "error",
        isClosable: true,
      });
    },
  };
  const exchangeVesselCRMTokenMutation = useExchangeVesselCRMToken(
    exchangeVesselCRMTokenMutationOptions
  );

  const linkVesselCRMTokenMutationOptions = {
    onSuccess: (data: any) => {
      const linkToken = data?.link_token;
      open({
        linkToken,
      });
      queryClient.invalidateQueries(QUERY_KEY_VESSEL);
    },
    onError: (error: AxiosError) => {
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to initiate connection with CRM";
      console.log({
        title: "Failed",
        description: message,
        status: "error",
        isClosable: true,
      });
    },
  };
  const linkVesselCRMTokenMutation = useLinkVesselCRMToken(
    linkVesselCRMTokenMutationOptions
  );
  const handleClickOnConnect = () =>
    linkVesselCRMTokenMutation.mutate({
      ...props,
      userId: props.namora_user_id,
      teamId: props.namora_team_id,
    });
  const handleClickOnDisconnect = () =>
    disconnectVesselCRMConnectionMutation.mutate({
      ...props,
      userId: props.namora_user_id,
      teamId: props.namora_team_id,
    });

  const { connectionText, connectionStatusText } =
    useGetVesselCRMConnectionStatus(
      publicToken,
      { ...props },
      exchangeVesselCRMTokenMutation
    );

  return {
    isCRMConnected,
    linkVesselCRMTokenMutation,
    handleClickOnConnect,
    handleClickOnDisconnect,
  };
};
