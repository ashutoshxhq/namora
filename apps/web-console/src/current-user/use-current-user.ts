import { useUser } from "@/auth0";

export const useCurrentUser = () => {
  const { user } = useUser();
  const teamId = user?.namora_team_id;
  const userId = user?.namora_user_id;
  const userName: string =
    user?.firstname && user?.lastname
      ? `${user?.firstname} ${user?.lastname}`
      : (user?.name as string);

  return {
    user,
    userName,
    teamId,
    userId,
  };
};
