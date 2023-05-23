import { withPageSessionAuthRequired } from "@/auth0/utils";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { queryClient, dehydrate } from "@/react-query";
import { getSession } from "@/auth0";
import { QUERY_KEY_TASKS } from "@/entities/tasks/constants";
import { tasksFetcher } from "@/entities/tasks/fetchers";
import { All } from "@/entities/tasks/ui";
import { teamUsersFetcher } from "@/current-team/fetchers";
import { QUERY_KEY_TEAM_USERS } from "@/current-team/constants";
import { ClientOnly } from "@/components/shared/client-only";

export default function AiTasks(props: any) {
  const session = { ...props.session };
  const allTasksPageProps = {
    ...props,
    teamId: session.user.namora_team_id,
    userId: session.user.namora_user_id,
    accessToken: session.accessToken,
  };
  return (
    <ClientOnly>
      <All {...allTasksPageProps} />
    </ClientOnly>
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

  const tasks = await tasksFetcher({
    baseURL: ENGINE_SERVICE_API_URL,
    teamId,
    accessToken,
  });
  await queryClient.prefetchQuery([...QUERY_KEY_TASKS, teamId], () =>
    tasksFetcher({
      baseURL: ENGINE_SERVICE_API_URL,
      teamId,
      accessToken,
    })
  );

  const teamUsers = await teamUsersFetcher({
    baseURL: ENGINE_SERVICE_API_URL,
    teamId,
    accessToken,
  });
  await queryClient.prefetchQuery([...QUERY_KEY_TEAM_USERS, teamId], () =>
    teamUsersFetcher({
      baseURL: ENGINE_SERVICE_API_URL,
      teamId,
      accessToken,
    })
  );

  return {
    ...pageSessionRedirectProps,
    props: {
      session: JSON.parse(JSON.stringify(session)),
      tasks: tasks?.data,
      teamUsers: teamUsers?.data,
      dehydratedState: dehydrate(queryClient),
    },
  };
}
