import React from "react";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

import { Account as AccountClientOnly } from "@/components/settings";
import { getSession } from "@/auth0";

export default function Account(props: any) {
  return <AccountClientOnly {...props} />;
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
