import { useVesselLink } from "@vesselapi/react-vessel-link";
import { useEffect, useRef, useState } from "react";
import { queryClient } from "@/react-query";

import { AxiosError, AxiosResponse } from "@/axios";
import {
  useDisconnectVesselCRMConnection,
  useExchangeVesselCRMToken,
  useLinkVesselCRMToken,
} from "@/vessel/shared/hooks";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import { QUERY_KEY_TEAMS } from "@/current-team/constants";

const TIMEOUT_MS = 7000;

export const useVesselCRMIntegration = (props: any) => {
  const accessToken = props?.accessToken;
  const teamId = props?.teamId;
  const connectionId = props?.connectionId;

  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    status: "",
  });
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
        title: "Success",
        description: "Disconnected from CRM",
        status: "success",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      queryClient.invalidateQueries([
        ...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
        teamId,
      ]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
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
      teamId,
      accessToken,
    });

  return {
    alertProps,
    handleClickOnConnect,
    handleClickOnDisconnect,
  };
};
