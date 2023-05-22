import { useQuery } from "@/react-query";
import { QUERY_KEY_TEAMS, QUERY_KEY_TEAM_USERS } from "./constants";
import { teamUsersFetcher, teamsFetcher } from "./fetchers";

export const useGetTeams = (props: any) => {
  const teamId = props?.teamId;
  const accessToken = props?.accessToken;
  const teams = props?.teams;

  const { data, isLoading, isFetched } = useQuery(
    [...QUERY_KEY_TEAMS, teamId],
    () => teamsFetcher({ baseURL: "/api", teamId, accessToken }),
    {
      initialData: teams,
      enabled: !!teamId && !!accessToken,
    }
  );

  return { data, isLoading, isFetched };
};

export const useGetTeamUsers = (props: any) => {
  const teamId = props?.teamId ?? "";
  const accessToken = props?.accessToken;
  const teamUsers = props?.teamUsers;

  const { data, isLoading, isFetched } = useQuery(
    [...QUERY_KEY_TEAM_USERS, teamId],
    () => teamUsersFetcher({ baseURL: "/api", teamId, accessToken }),
    {
      initialData: teamUsers,
      enabled: !!teamId && !!accessToken,
    }
  );

  return { data, isLoading, isFetched };
};
