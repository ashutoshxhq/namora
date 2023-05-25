import { getAccessToken } from "@/auth0";
import { withPageSessionAuthRequired } from "@/auth0/utils";
import { dehydrate, queryClient } from "@/react-query";
import { Account as AccountClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { TabLayout } from "@/components/settings/tab-layout";
import { teamUsersFetcher } from "@/current-team/fetchers";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { QUERY_KEY_TEAM_USERS } from "@/current-team/constants";

export default function Account(props: any) {
  const { user, teamId, userId, teamUsers } = props;

  const accountPageProps = {
    teamUsers,
    user,
    teamId,
    userId,
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

  let teamUsers = { data: [] };
  if (accessToken) {
    teamUsers = await teamUsersFetcher({
      baseURL,
      teamId,
      init: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    await queryClient.prefetchQuery([...QUERY_KEY_TEAM_USERS, teamId], () =>
      teamUsersFetcher({
        baseURL,
        teamId,
        init: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      })
    );
  }

  return {
    props: {
      userId,
      teamId,
      user,
      teamUsers: teamUsers?.data ?? [],
      dehydratedState: dehydrate(queryClient),
    },
  };
}
