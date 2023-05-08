import { useQuery } from "@/react-query";
import { getTeam } from "./api";
import { QUERY_KEY_TEAM } from "./constants";

export const useGetTeamData = (props: any) => {
  const accessToken = props.accessToken;
  const teamId = props.namora_team_id;

  const { data, isLoading, isFetched } = useQuery(
    QUERY_KEY_TEAM,
    () =>
      getTeam({
        accessToken,
        teamId,
      }),
    {
      enabled: !!accessToken && !!teamId,
    }
  );

  return { data, isLoading, isFetched };
};
