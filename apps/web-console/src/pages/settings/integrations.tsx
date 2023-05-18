import { getSession } from "@/auth0";
import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Integrations as IntegrationsClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { TabLayout } from "@/components/settings/tab-layout";
import { teamsFetcher } from "@/current-team/fetchers";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { vesselCRMConnectionStatusFetcher } from "@/vessel/shared/fetchers";
import { dehydrate, queryClient } from "@/react-query";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";

export default function Integrations(props: any) {
  const session = { ...props.session };
  const integrationsPageProps = {
    ...props,
    teamId: session.user.namora_team_id,
    userId: session.user.namora_user_id,
    accessToken: session.accessToken,
  };

  return (
    <TabLayout>
      <ClientOnly>
        <IntegrationsClientOnly {...integrationsPageProps} />
      </ClientOnly>
    </TabLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  const pageSessionRedirectProps = await withPageSessionAuthRequired(ctx);
  const session = await getSession(ctx.req, ctx.res);

  if (!session) {
    return {
      ...pageSessionRedirectProps,
    };
  }

  const teamId = session?.user?.namora_team_id;
  const accessToken = session?.accessToken as string;

  const teams = await teamsFetcher(ENGINE_SERVICE_API_URL, teamId, accessToken);
  const connectionId: string =
    (teams?.data?.vessel_connection_id as string) ?? "";

  let connectionObj = null;
  if (!!connectionId) {
    connectionObj = await vesselCRMConnectionStatusFetcher(
      ENGINE_SERVICE_API_URL,
      teamId,
      connectionId,
      accessToken
    );
    await queryClient.prefetchQuery(
      [...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS, teamId],
      () =>
        vesselCRMConnectionStatusFetcher(
          ENGINE_SERVICE_API_URL,
          teamId,
          connectionId,
          accessToken
        )
    );
  }

  return {
    ...pageSessionRedirectProps,
    props: {
      connectionObj,
      teams: teams?.data,
      dehydratedState: dehydrate(queryClient),
      session: JSON.parse(JSON.stringify(session)),
    },
  };
}
