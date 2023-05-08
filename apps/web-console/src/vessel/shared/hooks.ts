import { useEffect } from "react";
import {
  queryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/react-query";

import {
  exchangeVesselCRMToken,
  linkVesselCRMToken,
  getVesselCRMConnectionStatus,
  disconnectVesselCRMConnection,
} from "@/vessel/shared/api";

import { CONNECTION_STATUS_LIST } from "@/vessel/shared/constants";
import { QUERY_KEY_VESSEL } from "@/vessel/constants";
import { encodeBase64 } from "@/utils/string";
import { TMutationOptionProps, TVesselCRMConnection } from "./types";
import { useGetTeamData } from "@/current-team/hooks";

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
    }) =>
      exchangeVesselCRMToken({
        publicToken,
        accessToken,
        teamId,
      }),
    exchangeVesselCRMTokenMutationOptions
  );
  return exchangeVesselCRMTokenMutation;
};

export const useGetVesselCRMConnectionStatus = (
  publicToken: string,
  props: any,
  exchangeVesselCRMTokenMutation: any
) => {
  const accessToken = props.accessToken;
  const teamId = props.namora_team_id;

  const queryKeyVesselConnectionStatus = [
    ...QUERY_KEY_VESSEL,
    "connection-status",
  ];

  const { mutate: exchangeVesselCRMTokenMutate } =
    exchangeVesselCRMTokenMutation;

  useEffect(() => {
    if (publicToken) {
      exchangeVesselCRMTokenMutate({
        publicToken,
        teamId,
      });
    }
  }, [publicToken, teamId, exchangeVesselCRMTokenMutate]);

  const { data: teamData } = useGetTeamData(props);
  const connectionId = teamData?.vessel_connection_id ?? "";
  const encodedConnectionId = encodeBase64(connectionId);
  const check = !!connectionId;

  const { data: vesselCRMConnectionAPIData } = useQuery(
    queryKeyVesselConnectionStatus,
    () =>
      getVesselCRMConnectionStatus({
        connectionId: encodedConnectionId,
        accessToken,
        teamId,
      }),
    {
      enabled: !!accessToken && check,
      // onSuccess() {
      //   // const connectionObj: TVesselCRMConnection = data?.connection;
      //   // const connectionStatus = connectionObj?.status;
      //   // const isCRMConnected =
      //   //   CONNECTION_STATUS_LIST.includes(connectionStatus);
      //   // dispatch({ type: SET_IS_CRM_CONNECTED, isCRMConnected });
      //   queryClient.invalidateQueries(queryKeyVesselConnectionStatus);
      // },
    }
  );

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

  console.log({ connectionId });

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
