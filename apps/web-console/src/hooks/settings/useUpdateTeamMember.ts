import { TTeamMember } from "@/current-team/types";
import { useMutation } from "@/react-query";

type TMutationOptionProps = {
  onSuccess: () => void;
  onError: () => void;
};

export const updateTeamUsersFetcher = async (
  baseURL: string,
  teamId: string,
  userId: string,
  data: any,
  accessToken: string
) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ...data }),
    });
    const updateUserRes = await res.json();
    return updateUserRes;
  } catch (error) {
    throw error;
  }
};

export const useUpdateTeamMember = (
  updateTeamMemberOptions: TMutationOptionProps
) => {
  const updateTeamMemberMutation = useMutation(
    ({
      firstname,
      lastname,
      email,
      company_position,
      teamId,
      userId,
      accessToken,
    }: Omit<TTeamMember, "id"> & {
      teamId: string;
      userId: string;
      accessToken: string;
    }) => {
      const data = {
        firstname,
        lastname,
        email,
        company_position,
      };
      return updateTeamUsersFetcher("/api", teamId, userId, data, accessToken);
    },
    updateTeamMemberOptions
  );
  return updateTeamMemberMutation;
};
