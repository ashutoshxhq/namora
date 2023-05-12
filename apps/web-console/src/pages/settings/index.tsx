import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import Integrations from "@/pages/settings/integrations";
import Account from "@/pages/settings/account";
import TeamMembers from "@/pages/settings/team-members";

import { withPageSessionAuthRequired } from "@/auth0/utils";
import { settingTabList } from "@/routes/config";
import { classNames } from "@/utils";
import {
  SETTINGS,
  ACCOUNT,
  TEAM_MEMBERS,
  INTEGRATIONS,
} from "@/routes/constants";

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

  const appProps = {
    teamId: props.user.namora_team_id,
    accessToken: props.accessToken,
  };

  const isAccountPageSelected = !!query[ACCOUNT];
  const isTeamMembersPageSelected = !!query[TEAM_MEMBERS];
  const isIntegrationPageSelected = !!query[INTEGRATIONS];

  return (
    <>
      <Head>
        <title>Namora | Settings</title>
      </Head>
      <div className="pb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Settings
        </h3>
        <p className="mt-1 text-xs text-gray-500">...</p>
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
        {isAccountPageSelected && <Account {...appProps} />}
        {isTeamMembersPageSelected && <TeamMembers {...appProps} />}
        {isIntegrationPageSelected && <Integrations {...appProps} />}
      </section>
    </>
  );
}

export const getServerSideProps = withPageSessionAuthRequired;
