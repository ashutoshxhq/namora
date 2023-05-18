import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { FormInputTextField, FormInputEmailField } from "@/design-system/form";
import { useNotificationDispatch } from "@/contexts/notification";
import {
  QUERY_KEY_TEAMS,
  QUERY_KEY_TEAM_USERS,
} from "@/current-team/constants";
import { queryClient } from "@/react-query";
import { useUpdateTeamMember } from "@/hooks/settings/useUpdateTeamMember";
import { useGetTeamUsers } from "@/current-team/hooks";
import { TTeamMember } from "@/current-team/types";
import { ButtonLoader } from "@/design-system/molecules/button-loader";

const schema = yup.object().shape({
  first_name: yup.string().required("Required"),
  last_name: yup.string().required("Required"),
  email: yup.string().email().required("Required"),
  company_position: yup.string(),
});

export const PersonalDetails = (props: any) => {
  const { showNotification } = useNotificationDispatch();
  const teamId = props?.teamId;
  const userId = props?.userId;
  const accessToken = props?.accessToken;

  const { data = [] } = useGetTeamUsers(props);
  const teamUsers = data;
  const selectedMember = teamUsers?.find(
    (person: TTeamMember) => person.id === userId
  );
  const firstName = selectedMember?.firstname ?? "";
  const lastName = selectedMember?.lastname ?? "";
  const email = selectedMember?.email ?? "";
  const companyPosition = selectedMember?.company_position ?? "";

  const updateTeamMemberMutationOptions = {
    onSuccess: () => {
      showNotification({
        title: "Success",
        description: "User updated successfully",
        status: "success",
      });
      queryClient.invalidateQueries([...QUERY_KEY_TEAM_USERS, teamId]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
      reset();
    },
    onError: () => {
      showNotification({
        title: "Failed",
        description: "Update failed",
        status: "error",
      });
      queryClient.invalidateQueries([...QUERY_KEY_TEAM_USERS, teamId]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
    },
  };

  const updateTeamMemberMutation = useUpdateTeamMember(
    updateTeamMemberMutationOptions
  );
  const { mutate, isLoading } = updateTeamMemberMutation;

  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        first_name: firstName,
        last_name: lastName,
        email,
        company_position: companyPosition,
      },
      resolver: yupResolver(schema),
    }),
    [companyPosition, email, firstName, lastName]
  );
  const hookFormProps = useForm(useFormObj);

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = hookFormProps;

  useEffect(() => {
    reset({
      first_name: firstName,
      last_name: lastName,
      email: email,
      company_position: companyPosition,
    });
  }, [firstName, lastName, email, companyPosition, reset]);

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    if (isDirty) {
      mutate({
        firstname: submittedFormData.first_name,
        lastname: submittedFormData.last_name,
        email: submittedFormData.email,
        company_position: submittedFormData.company_position,
        teamId,
        userId,
        accessToken,
      });
    }
  };

  const disabled = "opacity-50 cursor-not-allowed";

  return (
    <>
      <div className="px-4 py-4 my-3 bg-white shadow sm:rounded-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid grid-cols-1 mt-10 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  First name
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="first-name"
                    name="first_name"
                    contextId="first-name"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="last-name"
                    name="last_name"
                    contextId="last-name"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Email
                </label>
                <div className="mt-2">
                  <FormInputEmailField
                    id="email"
                    name="email"
                    contextId="personal_details_email"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="company-position"
                  className="block text-sm font-medium leading-6 text-black"
                >
                  Company position
                </label>
                <div className="mt-2">
                  <FormInputTextField
                    id="company-position"
                    name="company_position"
                    contextId="company-position"
                    placeholder="..."
                    {...hookFormProps}
                  />
                </div>
              </div>
            </div>

            <div className="flex my-8">
              <button
                type="submit"
                className={`relative flex items-center justify-center px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  !isDirty || isLoading ? disabled : ""
                }`}
              >
                <ButtonLoader isLoading={isLoading} />
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
