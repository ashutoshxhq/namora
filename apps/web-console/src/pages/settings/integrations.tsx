import { getAccessToken } from "@/auth0";
import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Integrations as IntegrationsClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { TabLayout } from "@/components/settings/tab-layout";
import { teamsFetcher } from "@/current-team/fetchers";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { vesselCRMConnectionStatusFetcher } from "@/vessel/shared/fetchers";
import { dehydrate, queryClient } from "@/react-query";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import { QUERY_KEY_TEAMS } from "@/current-team/constants";

export default function Integrations(props: any) {
  const { user, teamId, userId, teams } = props;

  const integrationsPageProps = {
    teams,
    user,
    teamId,
    userId,
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
  const pageSessionAuthProps = await withPageSessionAuthRequired(ctx);
  const { props }: any = pageSessionAuthProps;

  const user = props?.user;
  const session = props?.session;
  const userId = user?.namora_user_id ?? "";
  const teamId = user?.namora_team_id ?? "";

  if (!session) {
    return {
      ...pageSessionAuthProps,
    };
  }

  let accessToken = "";
  if (session) {
    const data = await getAccessToken(ctx.req, ctx.res, {
      refresh: true,
    });
    accessToken = data?.accessToken as string;
  }

  const baseURL = ENGINE_SERVICE_API_URL;

  let teams = { data: [] };
  let connectionId = "";
  let connectionObj = null;

  if (accessToken) {
    const teams = await teamsFetcher({
      baseURL,
      teamId,
      init: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    await queryClient.prefetchQuery([...QUERY_KEY_TEAMS, teamId], () =>
      teamsFetcher({
        baseURL,
        teamId,
        init: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      })
    );
    connectionId = (teams?.data?.vessel_connection_id as string) ?? "";

    if (!!connectionId) {
      connectionObj = await vesselCRMConnectionStatusFetcher({
        baseURL,
        teamId,
        connectionId,
        init: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
      await queryClient.prefetchQuery(
        [...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS, teamId],
        () =>
          vesselCRMConnectionStatusFetcher({
            baseURL,
            teamId,
            connectionId,
            init: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          })
      );
    }
  }

  return {
    props: {
      userId,
      teamId,
      user,
      teams: teams?.data ?? [],
      connectionObj,
      dehydratedState: dehydrate(queryClient),
    },
  };
}
