import React from "react";

import { TeamMembers as TeamMembersClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { withPageSessionAuthRequired } from "@/auth0/utils";

export default function TeamMembers(props: any) {
  return (
    <ClientOnly>
      <TeamMembersClientOnly {...props} />
    </ClientOnly>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
