import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { withPageSessionAuthRequired } from "@/auth0/utils";
import { ALL, TASKS } from "@/routes/constants";

export default function Tasks() {
  const router = useRouter();

  useEffect(() => {
    if (router.asPath === `/${TASKS}`) {
      router.push(`/${TASKS}/${ALL}`);
    }
  }, [router]);

  return <div>Tasks</div>;
}

export const getServerSideProps = withPageSessionAuthRequired;
