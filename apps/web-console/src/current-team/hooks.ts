import { useQuery } from "@/react-query";
import { QUERY_KEY_TEAMS, QUERY_KEY_TEAM_USERS } from "./constants";
import { teamUsersFetcher, teamsFetcher } from "./fetchers";

export const useGetTeams = (props: any) => {
  const teamId = props?.teamId;
  const teams = props?.teams;

  const { data, isLoading, isFetched } = useQuery(
    [...QUERY_KEY_TEAMS, teamId],
    () => teamsFetcher({ baseURL: "/api", teamId }),
    {
      initialData: teams,
      enabled: !!teamId,
    }
  );

  return { data, isLoading, isFetched };
};

export const useGetTeamUsers = (props: any) => {
  const teamId = props?.teamId ?? "";
  const teamUsers = props?.teamUsers;

  const { data, isLoading, isFetched } = useQuery(
    [...QUERY_KEY_TEAM_USERS, teamId],
    () => teamUsersFetcher({ baseURL: "/api", teamId }),
    {
      initialData: teamUsers,
      enabled: !!teamId,
    }
  );

  return { data, isLoading, isFetched };
};
