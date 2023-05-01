import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import Link from "next/link";

import { classNames } from "@/utils";
import { tabs } from "settings/config";
import { SETTINGS } from "settings/constants";
import Account from "settings/ui/account";
import TeamMembers from "settings/ui/team-members";
import Integrations from "settings/ui/integrations";

export default function SettingsPage() {
  const router = useRouter();
  const _selectedTab = router?.query?.tab as string;
  const _selectedIndex = tabs.map((tab) => tab.id).indexOf(_selectedTab) ?? 0;

  // console.log("@[tab]", { router, _selectedTab, _selectedIndex });

  if (router.isReady && (!_selectedTab || _selectedIndex === -1)) {
    router?.replace(`/${SETTINGS}/404`, undefined, {
      shallow: true,
    });
  }
  return (
    <>
      <div className="pb-5 border-b border-gray-200 sm:pb-0">
        <Tab.Group
          selectedIndex={_selectedIndex}
          onChange={(index) => {
            const tab = tabs.at(index);
            router.replace(`/${SETTINGS}/${tab?.name}`, undefined, {
              shallow: true,
            });
          }}
        >
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <Tab.List
                as="nav"
                className="flex -mb-px space-x-8"
                aria-label="Tabs"
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={tab.id}
                    as={Link}
                    href={`/${SETTINGS}/${tab?.name}`}
                    shallow
                    className={classNames(
                      _selectedIndex === index
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                    )}
                    aria-current={tab.current ? "page" : undefined}
                  >
                    <p className="capitalize">{tab.name}</p>
                  </Tab>
                ))}
              </Tab.List>
            </div>
          </div>
          <Tab.Panels className="p-2 my-4 rounded-md bg-base-200 text-base-content">
            <Tab.Panel>
              <Account />
            </Tab.Panel>
            <Tab.Panel>
              <TeamMembers />
            </Tab.Panel>
            <Tab.Panel>
              <Integrations />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}
