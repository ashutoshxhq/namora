import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import Integrations from "@/pages/settings/integrations";
import Account from "@/pages/settings/account";
import TeamMembers from "@/pages/settings/team-members";

import { settingTabList } from "@/routes/config";
import { classNames } from "@/utils";
import {
  SETTINGS,
  ACCOUNT,
  TEAM_MEMBERS,
  INTEGRATIONS,
} from "@/routes/constants";
import { QUERY_KEY_TEAMS } from "@/current-team/constants";
import { dehydrate, queryClient } from "@/react-query";
import { getSession } from "@auth0/nextjs-auth0";
import { QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS } from "@/vessel/constants";
import { ENGINE_SERVICE_API_URL } from "@/axios/constants";
import { vesselCRMConnectionStatusFetcher } from "@/vessel/shared/fetchers";
import { teamUsersFetcher, teamsFetcher } from "@/current-team/fetchers";
import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Alert } from "@/design-system/molecules/alert";

const TabLink = ({ href, isSelected, title }: any) => {
  return (
    <Link
      href={href}
      shallow
      className={classNames(
        isSelected
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
        "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
      )}
    >
      {title}
    </Link>
  );
};

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
      router.push(decodeURIComponent(`/${SETTINGS}?${ACCOUNT}=true`));
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Namora | Settings</title>
      </Head>
      <div className="pb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Settings
        </h3>
        {/* <p className="mt-1 text-xs text-gray-500">...</p> */}
      </div>
      <div className="pb-5 border-gray-200 sm:pb-0">
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              {settingTabList.map((tab) => {
                const isSelected = !!query[tab.path];
                return (
                  <TabLink
                    key={tab.id}
                    as={Link}
                    href={`/${SETTINGS}?${tab?.path}=true`}
                    title={tab.name}
                    isSelected={isSelected}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      <section>
        {isAccountPageSelected && <Account {...settingPageProps} />}
        {isTeamMembersPageSelected && <TeamMembers {...settingPageProps} />}
        {isIntegrationPageSelected && <Integrations {...settingPageProps} />}
      </section>
      <Alert />
    </>
  );
}

export async function getServerSideProps(ctx: any) {
  const pageSessionRedirectProps = await withPageSessionAuthRequired(ctx);
  const session = await getSession(ctx.req, ctx.res);

  if (!session) {
    return {
      ...pageSessionRedirectProps,
    };
  }

  const teamId = session?.user?.namora_team_id;
  const accessToken = session?.accessToken as string;

  const teams = await teamsFetcher(ENGINE_SERVICE_API_URL, teamId, accessToken);
  const connectionId: string =
    (teams?.data?.vessel_connection_id as string) ?? "";
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";
  await queryClient.prefetchQuery([...QUERY_KEY_TEAMS, teamId], () =>
    teamsFetcher(ENGINE_SERVICE_API_URL, teamId, accessToken)
  );

  const teamUsers = await teamUsersFetcher(
    ENGINE_SERVICE_API_URL,
    teamId,
    accessToken
  );

  let connectionStatusRes;
  if (encodedConnectionId) {
    connectionStatusRes = await vesselCRMConnectionStatusFetcher(
      ENGINE_SERVICE_API_URL,
      teamId,
      encodedConnectionId,
      accessToken
    );
    await queryClient.prefetchQuery(
      [...QUERY_KEY_VESSEL_CRM_CONNECTION_STATUS, connectionId],
      () =>
        vesselCRMConnectionStatusFetcher(
          ENGINE_SERVICE_API_URL,
          teamId,
          encodedConnectionId,
          accessToken
        )
    );
  }
  const connectionStatus = connectionStatusRes?.connection?.status ?? "";

  return {
    ...pageSessionRedirectProps,
    props: {
      session: JSON.parse(JSON.stringify(session)),
      connectionId,
      connectionStatus,
      teams: teams?.data,
      teamUsers: teamUsers?.data,
      dehydratedState: dehydrate(queryClient),
    },
  };
}
