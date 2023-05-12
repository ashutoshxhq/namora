import React from "react";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

import { TeamMembers as TeamMembersClientOnly } from "@/components/settings";
import { getSession } from "@/auth0";
import { useGetTeamUsers } from "@/current-team/hooks";

export default function TeamMembers(props: any) {
  const { data } = useGetTeamUsers(props);

  return <TeamMembersClientOnly {...props} data={data} />;
}

export const getServerSideProps = async (
  props: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const session = await getSession(props.req, props.res);

  return {
    props: {
      session: JSON.parse(JSON.stringify(session)),
    },
  };
};
