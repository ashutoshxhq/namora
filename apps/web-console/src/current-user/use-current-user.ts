import { useUser } from "@/auth0";

export const useCurrentUser = () => {
  const { user } = useUser();
  const teamId = user?.namora_team_id;
  const userId = user?.namora_user_id;
  const userName = user?.name;

  return {
    user,
    userName,
    teamId,
    userId,
  };
};
