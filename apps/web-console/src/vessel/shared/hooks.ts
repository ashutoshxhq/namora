import { useMutation, useQuery } from "@/react-query";

import { CONNECTION_STATUS_LIST } from "@/vessel/shared/constants";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import {
  TMutationOptionProps,
  TVesselCRMConnection,
} from "@/vessel/shared/types";
import { exchangeVesselCRMToken, linkVesselCRMToken } from "./api";

// export const linkVesselCRMTokenFetcher = (teamId: string) =>
//   fetch(`api/teams/${teamId}/integrations/crm/link-token`, {
//     method: "POST",
//   });

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

// export const exchangeVesselCRMTokenFetcher = (
//   teamId: string,
//   dataObj: { publicToken: string }
// ) =>
//   fetch(`api/teams/${teamId}/integrations/crm/exchange-token`, {
//     method: "POST",
//     body: JSON.stringify(dataObj),
//   });

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

export const getVesselCRMConnectionStatusFetcher = (
  teamId: string,
  encodedConnectionId: string
) =>
  fetch(
    `api/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`
  );

export const useGetVesselCRMConnectionStatus = ({
  connectionId,
  teamId,
}: {
  connectionId: string;
  teamId: string;
}) => {
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

  const {
    data: vesselCRMConnectionAPIData,
    isLoading: isVesselCRMConnectionAPILoading,
  } = useQuery(
    QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS,
    () =>
      getVesselCRMConnectionStatusFetcher(teamId, encodedConnectionId).then(
        (res) => res.json()
      ),
    {
      enabled: !!connectionId && !!teamId,
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

export const getVesselCRMDisconnectStatusFetcher = (
  teamId: string,
  encodedConnectionId: string
) =>
  fetch(
    `api/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`,
    {
      method: "DELETE",
    }
  );

export const useDisconnectVesselCRMConnection = (
  disconnectVesselCRMConnectionMutationOptions: TMutationOptionProps
) => {
  const disconnectVesselCRMConnectionMutation = useMutation(
    ({ teamId, connectionId }: { teamId: string; connectionId: string }) => {
      const encodedConnectionId = encodeURIComponent(connectionId);

      return getVesselCRMDisconnectStatusFetcher(
        teamId,
        encodedConnectionId
      ).then((res) => res.json());
    },
    disconnectVesselCRMConnectionMutationOptions
  );

  return disconnectVesselCRMConnectionMutation;
};
