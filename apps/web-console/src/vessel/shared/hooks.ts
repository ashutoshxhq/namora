import { useMutation, useQuery, useQueryClient } from "@/react-query";

import {
  exchangeVesselCRMToken,
  linkVesselCRMToken,
  getVesselCRMConnectionStatus,
  disconnectVesselCRMConnection,
} from "@/vessel/shared/api";

import { CONNECTION_STATUS_LIST } from "@/vessel/shared/constants";
import {
  QUERY_KEY_VESSEL,
  QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
} from "@/vessel/constants";
import { encodeBase64 } from "@/utils/string";
import { TMutationOptionProps, TVesselCRMConnection } from "./types";

export const useLinkVesselCRMToken = (
  linkVesselCRMTokenMutationOptions: TMutationOptionProps
) => {
  const linkVesselCRMTokenMutation = useMutation(
    ({ accessToken, teamId }: { accessToken: string; teamId: string }) =>
      linkVesselCRMToken({
        accessToken,
        teamId,
      }),
    linkVesselCRMTokenMutationOptions
  );
  return linkVesselCRMTokenMutation;
};

export const useExchangeVesselCRMToken = (
  exchangeVesselCRMTokenMutationOptions: TMutationOptionProps
) => {
  const exchangeVesselCRMTokenMutation = useMutation(
    ({
      publicToken,
      accessToken,
      teamId,
    }: {
      publicToken: string;
      accessToken: string;
      teamId: string;
    }) => {
      console.log({ publicToken, teamId, accessToken });

      return exchangeVesselCRMToken({
        publicToken,
        accessToken,
        teamId,
      });
    },
    exchangeVesselCRMTokenMutationOptions
  );
  return exchangeVesselCRMTokenMutation;
};

export const useGetVesselCRMConnectionStatus = ({
  connectionId,
  accessToken,
  teamId,
}: {
  connectionId: string;
  accessToken: string;
  teamId: string;
}) => {
  const parsedConnectionId = connectionId;
  const encodedConnectionId = encodeBase64(connectionId);
  const check = !!connectionId;

  const { data: vesselCRMConnectionAPIData } = useQuery(
    QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
    () =>
      getVesselCRMConnectionStatus({
        connectionId,
        accessToken,
        teamId,
      }),
    {
      enabled: !!accessToken && check,
      onSuccess(data) {
        console.log("onSuccess", { data });
        // const connectionObj: TVesselCRMConnection = data?.connection;
        // const connectionStatus = connectionObj?.status;
        // const isCRMConnected =
        //   CONNECTION_STATUS_LIST.includes(connectionStatus);
        // dispatch({ type: SET_IS_CRM_CONNECTED, isCRMConnected });
        // queryClient.invalidateQueries(queryKeyVesselConnectionStatus);
      },
    }
  );

  console.log({
    parsedConnectionId,
    vesselCRMConnectionAPIData,
    connectionId,
    accessToken,
    teamId,
    encodedConnectionId,
  });
  const connectionObj: TVesselCRMConnection =
    vesselCRMConnectionAPIData?.connection;
  const connectionStatus = connectionObj?.status;
  const isCRMConnected = CONNECTION_STATUS_LIST.includes(connectionStatus);
  const connectionText = isCRMConnected
    ? "Connected with CRM"
    : vesselCRMConnectionAPIData?.message;
  const connectionStatusText: string = connectionObj?.status
    ? `(${connectionStatus})`
    : "";

  return {
    isCRMConnected,
    connectionStatusText,
    connectionText,
    vesselCRMConnectionAPIData,
  };
};

export const useDisconnectVesselCRMConnection = (
  disconnectVesselCRMConnectionMutationOptions: TMutationOptionProps
) => {
  const queryKeyVesselConnectionStatus = [
    ...QUERY_KEY_VESSEL,
    "connection-status",
  ];
  const queryClient = useQueryClient();

  const data = queryClient.getQueryData<any>(queryKeyVesselConnectionStatus);
  const connectionId = data?.connectionId;

  const disconnectVesselCRMConnectionMutation = useMutation(
    ({ accessToken, teamId }: { accessToken: string; teamId: string }) =>
      disconnectVesselCRMConnection({
        accessToken,
        teamId,
        connectionId,
      }),
    disconnectVesselCRMConnectionMutationOptions
  );

  return disconnectVesselCRMConnectionMutation;
};
