import { useVesselLink } from "@vesselapi/react-vessel-link";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@/react-query";

import {
  useDisconnectVesselCRMConnection,
  useExchangeVesselCRMToken,
  useGetVesselCRMConnectionStatus,
  useLinkVesselCRMToken,
} from "@/vessel/shared/hooks";
import { QUERY_KEY_VESSEL } from "@/vessel/constants";
import { AxiosError, AxiosResponse } from "axios";
import { useGetTeamData } from "@/current-team/hooks";

const TIMEOUT_MS = 5000;

export const useVesselCRMIntegration = (props: any) => {
  const [publicToken, setPublicToken] = useState("");
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    status: "",
  });
  const accessToken = props.accessToken;
  const teamId = props.namora_team_id;
  const userId = props.namora_user_id;
  const alertTimeoutRef = useRef<NodeJS.Timeout>();

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
        title: "Connection Disconnected",
        description: "...",
        status: "",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries(QUERY_KEY_VESSEL);
    },
    onError: () => {
      setAlertContent({
        title: "Unable to disconnect",
        description: "...",
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
      setPublicToken(publicToken);
    }
  };

  const { open } = useVesselLink({
    onSuccess: onVesselCRMConnectionSuccess,
  });

  const exchangeVesselCRMTokenMutationOptions = {
    onSuccess: (data: any) => {
      console.log("exchange", { data });
      setAlertContent({
        title: "Integration Successful",
        description: "...",
        status: "success",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries(QUERY_KEY_VESSEL);
    },
    onError: (error: AxiosError) => {
      console.log("exchange", { error });
      const response: AxiosResponse = error?.response!;
      const data: { message: string; statusCode: number } = response?.data;
      const message = data?.message || "Unable to connect with CRM";
      setAlertContent({
        title: message,
        description: "...",
        status: "error",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries(QUERY_KEY_VESSEL);
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
      setAlertContent({
        title: message,
        description: "...",
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
      accessToken,
      teamId,
    });

  const { data } = useGetTeamData(props);
  const connectionId = data?.data?.vessel_connection_id ?? "";
  const { isCRMConnected, connectionText, connectionStatusText } =
    useGetVesselCRMConnectionStatus({ connectionId, accessToken, teamId });

  console.log("useVesselCRMIntegration", {
    connectionId,
    isCRMConnected,
    connectionText,
    connectionStatusText,
  });

  return {
    isCRMConnected,
    alertProps,
    handleClickOnConnect,
    handleClickOnDisconnect,
  };
};
