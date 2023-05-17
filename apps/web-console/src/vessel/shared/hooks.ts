import { useMutation, useQuery } from "@/react-query";

import { CONNECTION_STATUS_LIST } from "@/vessel/shared/constants";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import {
  TMutationOptionProps,
  TVesselCRMConnection,
} from "@/vessel/shared/types";
import {
  vesselCRMConnectionStatusFetcher,
  vesselCRMDisconnectStatusFetcher,
} from "@/vessel/shared/fetchers";
import { useGetTeams } from "@/current-team/hooks";
import { exchangeVesselCRMToken, linkVesselCRMToken } from "./api";

export const useLinkVesselCRMToken = (
  linkVesselCRMTokenMutationOptions: TMutationOptionProps
) => {
  const linkVesselCRMTokenMutation = useMutation(
    // ({ accessToken, teamId }: { accessToken: string; teamId: string }) => {
    //   return linkVesselCRMTokenFetcher("/api", teamId, accessToken);
    // },
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
      // return exchangeVesselCRMTokenFetcher(
      //   "/api",
      //   teamId,
      //   accessToken,
      //   publicToken
      // );
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
  teamId,
  accessToken,
  teams,
}: {
  teamId: string;
  accessToken: string;
  teams: any;
}) => {
  const props = {
    teamId,
    accessToken,
    teams,
  };

  const { data } = useGetTeams(props);
  const connectionId: string =
    (data?.data?.vessel_connection_id as string) ?? "";
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

  const {
    data: vesselCRMConnectionAPIData,
    isLoading: isVesselCRMConnectionAPILoading,
  } = useQuery(
    [...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS, connectionId],
    () =>
      vesselCRMConnectionStatusFetcher(
        "/api",
        teamId,
        encodedConnectionId,
        accessToken
      ),
    {
      enabled: !!connectionId && !!teamId && !!accessToken,
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
  const disconnectVesselCRMConnectionMutation = useMutation(
    ({
      teamId,
      connectionId,
      accessToken,
    }: {
      teamId: string;
      connectionId: string;
      accessToken: string;
    }) => {
      const encodedConnectionId = encodeURIComponent(connectionId);

      return vesselCRMDisconnectStatusFetcher(
        "/api",
        teamId,
        encodedConnectionId,
        accessToken
      );
    },
    disconnectVesselCRMConnectionMutationOptions
  );

  return disconnectVesselCRMConnectionMutation;
};
