import React, { useEffect, useMemo, useRef, useState } from "react";
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";

import { FormInputEmailField, FormInputTextField } from "@/design-system/form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TTeamMember } from "@/current-team/types";
import { useUpdateTeamMember } from "@/hooks/settings/useUpdateTeamMember";
import { queryClient, useQueryClient } from "@/react-query";
import {
  QUERY_KEY_TEAMS,
  QUERY_KEY_TEAM_USERS,
} from "@/current-team/constants";
import { Alert } from "@/design-system/molecules/alert";

const TIMEOUT_MS = 7000;

const schema = yup.object().shape({
  first_name: yup.string().required("Required"),
  last_name: yup.string().required("Required"),
  email: yup.string().email().required("Required"),
  company_position: yup.string().nullable(),
});

export const FormUpdateUser = ({
  selectedMember,
  ...rest
}: {
  selectedMember: TTeamMember;
  accessToken: string;
  teamId: string;
  userId: string;
  setOpen: (value: boolean) => void;
}) => {
  const firstName = selectedMember.firstname ?? "";
  const lastName = selectedMember.lastname ?? "";
  const email = selectedMember.email ?? "";
  const companyPosition = selectedMember.company_position ?? "";

  const accessToken = rest?.accessToken;
  const teamId = rest?.teamId;
  const userId = rest?.userId;

  const setPanelOpen = rest.setOpen;

  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    status: "",
  });
  const alertTimeoutRef = useRef<NodeJS.Timeout>();

  const alertProps = {
    ...alertContent,
    show: showAlert,
    setShow: setShowAlert,
  };

  const updateTeamMemberMutationOptions = {
    onSuccess: () => {
      setAlertContent({
        title: "Success",
        description: "Team member details are updated",
        status: "success",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      setPanelOpen(false);
      queryClient.invalidateQueries([...QUERY_KEY_TEAM_USERS, teamId]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
      reset();
    },
    onError: () => {
      setAlertContent({
        title: "Failed",
        description: "Team member details are not updated",
        status: "error",
      });
      alertProps.setShow(true);
      alertTimeoutRef.current = setTimeout(
        () => alertProps.setShow(false),
        TIMEOUT_MS
      );
      setPanelOpen(false);
      queryClient.invalidateQueries([...QUERY_KEY_TEAM_USERS, teamId]);
      queryClient.invalidateQueries([...QUERY_KEY_TEAMS, teamId]);
    },
  };

  const updateTeamMemberMutation = useUpdateTeamMember(
    updateTeamMemberMutationOptions
  );
  const { mutate } = updateTeamMemberMutation;

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
  const { handleSubmit, reset } = hookFormProps;

  useEffect(() => {
    reset({
      first_name: firstName,
      last_name: lastName,
      email: email,
      company_position: companyPosition,
    });
  }, [firstName, lastName, email, companyPosition, reset]);

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    mutate({
      firstname: submittedFormData.first_name,
      lastname: submittedFormData.last_name,
      email: submittedFormData.email,
      company_position: submittedFormData.company_position,
      teamId,
      userId,
      accessToken,
    });
  };

  return (
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
                contextId="email"
                placeholder="..."
                {...hookFormProps}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="company_position"
              className="block text-sm font-medium leading-6 text-black"
            >
              Company Position
            </label>
            <div className="mt-2">
              <FormInputTextField
                id="company_position"
                name="company_position"
                contextId="company_position"
                placeholder="..."
                {...hookFormProps}
              />
            </div>
          </div>
        </div>

        <div className="flex my-8">
          <button
            type="submit"
            className="px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
      <Alert {...alertProps} />
    </div>
  );
};
