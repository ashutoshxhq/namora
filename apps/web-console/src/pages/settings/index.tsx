import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Integrations from "@/pages/settings/integrations";
import Account from "@/pages/settings/account";
import TeamMembers from "@/pages/settings/team-members";

import {
  SETTINGS,
  ACCOUNT,
  TEAM_MEMBERS,
  INTEGRATIONS,
} from "@/routes/constants";
import { withPageSessionAuthRequired } from "@/auth0/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { query } = router;

  const isAccountPageSelected = !!query[ACCOUNT];
  const isTeamMembersPageSelected = !!query[TEAM_MEMBERS];
  const isIntegrationPageSelected = !!query[INTEGRATIONS];

  useEffect(() => {
    if (router.asPath === `/${SETTINGS}`) {
      router.push(`/${SETTINGS}/${ACCOUNT}`);
    }
  }, [router]);

  return (
    <section>
      {isAccountPageSelected && <Account />}
      {isTeamMembersPageSelected && <TeamMembers />}
      {isIntegrationPageSelected && <Integrations />}
    </section>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
