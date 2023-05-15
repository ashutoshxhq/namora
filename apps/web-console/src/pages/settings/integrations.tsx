import React from "react";
import { GetServerSideProps } from "next";

import { Integrations as IntegrationsClientOnly } from "@/components/settings";
import { dehydrate, queryClient } from "@/react-query";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import { QUERY_KEY_TEAMS } from "@/current-team/constants";
import { teamUsersFetcher, useGetAllTeam } from "@/current-team/hooks";
import {
  getVesselCRMConnectionStatusFetcher,
  useGetVesselCRMConnectionStatus,
} from "@/vessel/shared/hooks";
import { ClientOnly } from "@/components/shared/client-only";

export default function Integrations(props: any) {
  const teamId = props?.teamId;

  const { data, isLoading } = useGetAllTeam();
  const connectionId = data?.vessel_connection_id ?? "";

  const { isCRMConnected, connectionStatus = "" } =
    useGetVesselCRMConnectionStatus({
      connectionId,
      teamId,
    });

  const integrationPageProps = {
    teamId: props.teamId,
    accessToken: props.accessToken,
    connectionId,
    connectionStatus,
    isCRMConnected,
  };

  return (
    <ClientOnly>
      <IntegrationsClientOnly {...integrationPageProps} />
    </ClientOnly>
  );
}

export const getServerSideProps: GetServerSideProps = async (props: any) => {
  const teamId = props?.user?.namora_team_id;
  await queryClient.prefetchQuery(QUERY_KEY_TEAMS, () =>
    teamUsersFetcher(teamId)
  );
  const data = queryClient.getQueryData<any>(QUERY_KEY_TEAMS);
  const connectionId = data?.data?.vessel_connection_id ?? "";
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

  await queryClient.prefetchQuery(QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS, () =>
    getVesselCRMConnectionStatusFetcher(teamId, encodedConnectionId)
  );
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
