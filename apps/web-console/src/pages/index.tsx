import Head from "next/head";
import React from "react";

import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Window } from "@/components/chats";

export default function Index(props: any) {
  return (
    <>
      <Head>
        <title>Namora | AI Chat</title>
      </Head>
      <Window {...props} />
    </>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
