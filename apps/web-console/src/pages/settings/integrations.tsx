import React from "react";

import { Integrations as IntegrationsClientOnly } from "@/components/settings";
import { ClientOnly } from "@/components/shared/client-only";
import { withPageSessionAuthRequired } from "@/auth0/utils";

export default function Integrations(props: any) {
  return (
    <ClientOnly>
      <IntegrationsClientOnly {...props} />
    </ClientOnly>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
