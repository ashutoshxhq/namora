import { useQuery } from "@/react-query";
import {
  QUERY_KEY_TEAM,
  QUERY_KEY_TEAMS,
  QUERY_KEY_TEAM_USERS,
} from "./constants";

export const useGetAllTeam = () => {
  const { data, isLoading, isFetched } = useQuery(QUERY_KEY_TEAMS, () =>
    fetch(`/api/teams`).then((res) => res.json())
  );

  return { data, isLoading, isFetched };
};

export const useGetTeam = (props: any) => {
  const teamId = props?.teamId;

  const { data, isLoading, isFetched } = useQuery(QUERY_KEY_TEAM, () =>
    fetch(`/api/teams/${teamId}`).then((res) => res.json())
  );

  return { data, isLoading, isFetched };
};

export const teamUsersFetcher = (teamId: string) =>
  fetch(`/api/teams/${teamId}/users`);

export const useGetTeamUsers = (props: any) => {
  const teamId = props?.teamId;

  const { data, isLoading, isFetched } = useQuery(QUERY_KEY_TEAM_USERS, () =>
    teamUsersFetcher(teamId).then((res) => res.json())
  );

  return { data, isLoading, isFetched };
};
