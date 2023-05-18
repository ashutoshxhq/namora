import { useVesselLink } from "@vesselapi/react-vessel-link";
import { queryClient } from "@/react-query";

import { AxiosError, AxiosResponse } from "@/axios";
import {
  useDisconnectVesselCRMConnection,
  useExchangeVesselCRMToken,
  useGetVesselCRMConnectionStatus,
  useLinkVesselCRMToken,
} from "@/vessel/shared/hooks";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import { QUERY_KEY_TEAMS } from "@/current-team/constants";
import { useNotificationDispatch } from "@/contexts/notification";

export const useVesselCRMIntegration = (props: any) => {
  const accessToken = props?.accessToken;
  const teamId = props?.teamId;

  const {
    connectionId,
    isCRMConnected,
    connectionStatus = "",
    isVesselCRMConnectionAPILoading,
  } = useGetVesselCRMConnectionStatus(props);

  const { showNotification } = useNotificationDispatch();

  const disconnectVesselCRMConnectionMutationOptions = {
    onSuccess: () => {
      showNotification({
        title: "Success",
        description: "Disconnected from CRM",
        status: "success",
      });
      queryClient.invalidateQueries([
        ...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
        teamId,
      ]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
    },
    onError: () => {
      showNotification({
        title: "Failed",
        description: "Unable to disconnect",
        status: "error",
      });
      queryClient.invalidateQueries([
        ...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
        teamId,
      ]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
    },
  };
  const disconnectVesselCRMConnectionMutation =
    useDisconnectVesselCRMConnection(
      disconnectVesselCRMConnectionMutationOptions
    );

  const onVesselCRMConnectionSuccess = (publicToken: string): void => {
    if (publicToken) {
      exchangeVesselCRMTokenMutation.mutate({
        publicToken,
        teamId,
        accessToken,
      });
    }
  };

  const { open } = useVesselLink({
    onSuccess: onVesselCRMConnectionSuccess,
  });

  const exchangeVesselCRMTokenMutationOptions = {
    onSuccess: () => {
      showNotification({
        title: "Success",
        description: "Connected with CRM",
        status: "success",
      });
      queryClient.invalidateQueries([
        ...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
        teamId,
      ]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
    },
    onError: (error: AxiosError) => {
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to connect with CRM";
      showNotification({
        title: "Failed",
        description: message,
        status: "error",
      });
      queryClient.invalidateQueries([
        ...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
        teamId,
      ]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
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
    },
    onError: (error: AxiosError) => {
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to initiate connection with CRM";
      showNotification({
        title: "Failed",
        description: message,
        status: "error",
      });
    },
  };
  const linkVesselCRMTokenMutation = useLinkVesselCRMToken(
    linkVesselCRMTokenMutationOptions
  );
  const handleClickOnConnect = () =>
    linkVesselCRMTokenMutation.mutate({
      accessToken,
      teamId,
    });
  const handleClickOnDisconnect = () =>
    disconnectVesselCRMConnectionMutation.mutate({
      connectionId,
      teamId,
      accessToken,
    });

  const isConnectionLoading =
    disconnectVesselCRMConnectionMutation.isLoading ||
    isVesselCRMConnectionAPILoading;

  return {
    connectionId,
    isCRMConnected,
    connectionStatus,
    isConnectionLoading,
    handleClickOnConnect,
    handleClickOnDisconnect,
  };
};
