import { useMutation, useQuery } from "@/react-query";

import {
  exchangeVesselCRMToken,
  linkVesselCRMToken,
  getVesselCRMConnectionStatus,
  disconnectVesselCRMConnection,
} from "@/vessel/shared/api";

import { CONNECTION_STATUS_LIST } from "@/vessel/shared/constants";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import {
  TMutationOptionProps,
  TVesselCRMConnection,
} from "@/vessel/shared/types";

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
  const encodedConnectionId = encodeURIComponent(connectionId);

  const {
    data: vesselCRMConnectionAPIData,
    isLoading: isVesselCRMConnectionAPILoading,
  } = useQuery(
    QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
    () =>
      getVesselCRMConnectionStatus({
        connectionId: encodedConnectionId,
        accessToken,
        teamId,
      }),
    {
      enabled: !!accessToken && !!connectionId && !!accessToken && !!teamId,
    }
  );

  const connectionObj: TVesselCRMConnection =
    vesselCRMConnectionAPIData?.connection;
  const connectionStatus = connectionObj?.status;
  const isCRMConnected = CONNECTION_STATUS_LIST.includes(connectionStatus);

  return {
    isCRMConnected,
    connectionStatus,
    vesselCRMConnectionAPIData,
    isVesselCRMConnectionAPILoading,
  };
};

export const useDisconnectVesselCRMConnection = (
  disconnectVesselCRMConnectionMutationOptions: TMutationOptionProps
) => {
  // const queryClient = useQueryClient();
  // const data = queryClient.getQueryData<any>(
  //   QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS
  // );
  // const connectionId = data?.connection?.connectionId;
  // const encodedConnectionId = encodeURIComponent(connectionId);

  const disconnectVesselCRMConnectionMutation = useMutation(
    ({
      accessToken,
      teamId,
      connectionId,
    }: {
      accessToken: string;
      teamId: string;
      connectionId: string;
    }) => {
      const encodedConnectionId = encodeURIComponent(connectionId);

      return disconnectVesselCRMConnection({
        accessToken,
        teamId,
        connectionId: encodedConnectionId,
      });
    },
    disconnectVesselCRMConnectionMutationOptions
  );

  return disconnectVesselCRMConnectionMutation;
};
