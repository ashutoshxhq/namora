import React from "react";

import { Account as AccountClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { withPageSessionAuthRequired } from "@/auth0/utils";

export default function Account(props: any) {
  return (
    <ClientOnly>
      <AccountClientOnly {...props} />
    </ClientOnly>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
