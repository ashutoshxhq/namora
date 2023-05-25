import { getAccessToken, getSession } from "@/auth0";
import { withPageSessionAuthRequired } from "@/auth0/utils";
import { dehydrate, queryClient } from "@/react-query";
import { Account as AccountClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { TabLayout } from "@/components/settings/tab-layout";
import { teamUsersFetcher } from "@/current-team/fetchers";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { QUERY_KEY_TEAM_USERS } from "@/current-team/constants";

export default function Account(props: any) {
  const session = { ...props.session };
  const accountPageProps = {
    ...props,
    teamId: session.user.namora_team_id,
    userId: session.user.namora_user_id,
    accessToken: session.accessToken,
  };

  return (
    <TabLayout>
      <ClientOnly>
        <AccountClientOnly {...accountPageProps} />
      </ClientOnly>
    </TabLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  const pageSessionRedirectProps = await withPageSessionAuthRequired(ctx);
  const session = await getSession(ctx.req, ctx.res);
  const { accessToken } = await getAccessToken(ctx.req, ctx.res, {
    refresh: true,
  })
  if (!session) {
    return {
      ...pageSessionRedirectProps,
    };
  }

  const teamId = session?.user?.namora_team_id;

  const teamUsers = await teamUsersFetcher({
    baseURL: ENGINE_SERVICE_API_URL,
    teamId,
    accessToken: accessToken || "",
  });
  await queryClient.prefetchQuery([...QUERY_KEY_TEAM_USERS, teamId], () =>
    teamUsersFetcher({
      baseURL: ENGINE_SERVICE_API_URL,
      teamId,
      accessToken: accessToken || "",
    })
  );

  return {
    ...pageSessionRedirectProps,
    props: {
      session: JSON.parse(JSON.stringify({...session, accessToken})),
      teamUsers: teamUsers?.data,
      dehydratedState: dehydrate(queryClient),
    },
  };
}
