import { getAxiosClientInternal } from "@/axios";
import { TTeamMember } from "@/current-team/types";
import { useMutation } from "@/react-query";

type TMutationOptionProps = {
  onSuccess: () => void;
  onError: () => void;
};

export const updateTeamUsersFetcher = ({
  teamId,
  userId,
  body,
  accessToken,
}: {
  teamId: string;
  userId: string;
  body: any;
  accessToken: string;
}) =>
  getAxiosClientInternal(accessToken).patch(
    `/api/teams/${teamId}/users/${userId}`,
    {
      ...body,
    }
  );

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
      const body = {
        firstname,
        lastname,
        email,
        company_position,
      };
      return updateTeamUsersFetcher({ teamId, userId, body, accessToken });
    },
    updateTeamMemberOptions
  );
  return updateTeamMemberMutation;
};
