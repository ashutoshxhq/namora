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
import { Alert } from "@/design-system/molecules/alert";

export default function SettingsPage(props: any) {
  const router = useRouter();
  const { query } = router;

  const session = { ...props.session };
  const settingPageProps = {
    ...props,
    teamId: session.user.namora_team_id,
    userId: session.user.namora_user_id,
    accessToken: session.accessToken,
  };

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
      {isAccountPageSelected && <Account {...settingPageProps} />}
      {isTeamMembersPageSelected && <TeamMembers {...settingPageProps} />}
      {isIntegrationPageSelected && <Integrations {...settingPageProps} />}
    </section>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
