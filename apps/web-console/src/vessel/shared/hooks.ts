import { useMutation, useQuery } from "@/react-query";

import { CONNECTION_STATUS_LIST } from "@/vessel/shared/constants";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import {
  TMutationOptionProps,
  TVesselCRMConnection,
} from "@/vessel/shared/types";
import {
  exchangeVesselCRMTokenFetcher,
  linkVesselCRMTokenFetcher,
  vesselCRMConnectionStatusFetcher,
  vesselCRMDisconnectStatusFetcher,
} from "@/vessel/shared/fetchers";
import { useGetTeams } from "@/current-team/hooks";

export const useLinkVesselCRMToken = (
  linkVesselCRMTokenMutationOptions: TMutationOptionProps
) => {
  const linkVesselCRMTokenMutation = useMutation(
    ({ teamId }: { teamId: string }) => {
      return linkVesselCRMTokenFetcher("/api", teamId);
    },
    linkVesselCRMTokenMutationOptions
  );
  return linkVesselCRMTokenMutation;
};

export const useExchangeVesselCRMToken = (
  exchangeVesselCRMTokenMutationOptions: TMutationOptionProps
) => {
  const exchangeVesselCRMTokenMutation = useMutation(
    ({ publicToken, teamId }: { publicToken: string; teamId: string }) => {
      return exchangeVesselCRMTokenFetcher("/api", teamId, publicToken);
    },
    exchangeVesselCRMTokenMutationOptions
  );
  return exchangeVesselCRMTokenMutation;
};

export const useGetVesselCRMConnectionStatus = ({
  teamId,
  teams,
  connectionObj,
}: {
  teamId: string;
  teams: any;
  connectionObj: { [key: string]: any };
}) => {
  const props = {
    teamId,
    teams,
  };

  const { data, isLoading: isTeamsLoading } = useGetTeams(props);
  const connectionId: string =
    (data?.data?.vessel_connection_id as string) ?? "";

  const {
    data: vesselCRMConnectionAPIData,
    isLoading: isVesselCRMConnectionAPILoading,
  } = useQuery(
    [...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS, teamId],
    () =>
      vesselCRMConnectionStatusFetcher({
        baseURL: "/api",
        teamId,
        connectionId,
      }),
    {
      initialData: connectionObj,
      enabled: !!connectionId && !!teamId,
    }
  );

  const _connectionObj: TVesselCRMConnection =
    vesselCRMConnectionAPIData?.connection;
  const connectionStatus = _connectionObj?.status;
  const _connectionId = _connectionObj?.connectionId;
  const isCRMConnected = CONNECTION_STATUS_LIST.includes(connectionStatus);

  const isLoading = isTeamsLoading || isVesselCRMConnectionAPILoading;

  return {
    isCRMConnected,
    connectionStatus,
    connectionId: _connectionId,
    vesselCRMConnectionAPIData,
    isVesselCRMConnectionAPILoading: isLoading,
  };
};

export const useDisconnectVesselCRMConnection = (
  disconnectVesselCRMConnectionMutationOptions: TMutationOptionProps
) => {
  const disconnectVesselCRMConnectionMutation = useMutation(
    ({ teamId, connectionId }: { teamId: string; connectionId: string }) => {
      return vesselCRMDisconnectStatusFetcher("/api", teamId, connectionId);
    },
    disconnectVesselCRMConnectionMutationOptions
  );

  return disconnectVesselCRMConnectionMutation;
};
