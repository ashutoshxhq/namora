import Head from "next/head";

import { withPageSessionAuthRequired } from "@/auth0/utils";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { queryClient, dehydrate } from "@/react-query";
import { getAccessToken } from "@/auth0";
import { QUERY_KEY_TASKS } from "@/entities/tasks/constants";
import { tasksFetcher } from "@/entities/tasks/fetchers";
import { All } from "@/entities/tasks/ui";
import { teamUsersFetcher } from "@/current-team/fetchers";
import { QUERY_KEY_TEAM_USERS } from "@/current-team/constants";
import { ClientOnly } from "@/components/shared/client-only";

export default function AllTasks(props: any) {
  const { user, teamId, userId, teamUsers, tasks } = props;

  const allTasksPageProps = {
    teamUsers,
    tasks,
    user,
    teamId,
    userId,
  };
  return (
    <>
      <Head>
        <title>Namora | Tasks</title>
      </Head>
      <ClientOnly>
        <All {...allTasksPageProps} />
      </ClientOnly>
    </>
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

  let tasks = { data: [] };
  if (accessToken) {
    tasks = await tasksFetcher({
      baseURL,
      teamId,
      init: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
    await queryClient.prefetchQuery([...QUERY_KEY_TASKS, teamId], () =>
      tasksFetcher({
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
      tasks: tasks?.data,
      teamUsers: teamUsers?.data,
      dehydratedState: dehydrate(queryClient),
    },
  };
}
