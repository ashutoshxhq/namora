import { useVesselLink } from "@vesselapi/react-vessel-link";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@/react-query";

import { AxiosError, AxiosResponse } from "@/axios";
import {
  useDisconnectVesselCRMConnection,
  useExchangeVesselCRMToken,
  useGetVesselCRMConnectionStatus,
  useLinkVesselCRMToken,
} from "@/vessel/shared/hooks";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import { useGetTeamData } from "@/current-team/hooks";

const TIMEOUT_MS = 7000;

export const useVesselCRMIntegration = (props: any) => {
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    status: "",
  });
  const accessToken = props.accessToken;
  const teamId = props.namora_team_id;
  const alertTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnectionEnabled, setIsConnectionEnabled] = useState(false);

  const alertProps = {
    ...alertContent,
    show: showAlert,
    setShow: setShowAlert,
  };

  useEffect(() => {
    const timeout = alertTimeoutRef.current;
    return () => clearTimeout(timeout);
  }, [alertTimeoutRef]);

  const disconnectVesselCRMConnectionMutationOptions = {
    onSuccess: () => {
      setAlertContent({
        title: "Success",
        description: "Disconnected from CRM",
        status: "success",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries(QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS);
    },
    onError: () => {
      setAlertContent({
        title: "Failed",
        description: "Unable to disconnect",
        status: "error",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
    },
    retry: false,
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
    onSuccess: (data: any) => {
      setAlertContent({
        title: "Success",
        description: "Connected with CRM",
        status: "success",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries(QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS);
    },
    onError: (error: AxiosError) => {
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to connect with CRM";
      setAlertContent({
        title: "Failed",
        description: message,
        status: "error",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries(QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS);
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
      queryClient.invalidateQueries(QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS);
    },
    onError: (error: AxiosError) => {
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to initiate connection with CRM";
      setAlertContent({
        title: "Failed",
        description: message,
        status: "error",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
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
      accessToken,
      teamId,
    });

  const { data } = useGetTeamData(props);
  const connectionId = data?.data?.vessel_connection_id ?? "";
  const { isCRMConnected, connectionStatus } = useGetVesselCRMConnectionStatus({
    connectionId,
    accessToken,
    teamId,
  });

  useEffect(() => {
    setIsConnectionEnabled(isCRMConnected);
  }, [isCRMConnected]);

  return {
    isConnectionEnabled,
    connectionStatus,
    alertProps,
    handleClickOnConnect,
    handleClickOnDisconnect,
  };
};
