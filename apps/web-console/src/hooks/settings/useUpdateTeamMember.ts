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
  data: any
) => {
  try {
    const res = await fetch(`${baseURL}/teams/${teamId}/users/${userId}`, {
      method: "PATCH",
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
    }: Omit<TTeamMember, "id"> & {
      teamId: string;
      userId: string;
    }) => {
      const data = {
        firstname,
        lastname,
        email,
        company_position,
      };
      return updateTeamUsersFetcher("/api", teamId, userId, data);
    },
    updateTeamMemberOptions
  );
  return updateTeamMemberMutation;
};
