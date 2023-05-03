import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import Link from "next/link";

import { classNames } from "@/utils";
import { NOT_FOUND, SETTINGS } from "@/routes/constants";
import { settingTabList } from "@/routes/config";
import Account from "settings/ui/account";
import TeamMembers from "settings/ui/team-members";
import Integrations from "settings/ui/integrations";

export default function SettingsPage() {
  const router = useRouter();
  const _selectedTab = router?.query?.tab as string;
  const _selectedIndex =
    settingTabList.map((tab) => tab.id).indexOf(_selectedTab) ?? 0;

  // console.log("@[tab]", { router, _selectedTab, _selectedIndex });

  if (router.isReady && (!_selectedTab || _selectedIndex === -1)) {
    router?.replace(`/${SETTINGS}/${NOT_FOUND}`, undefined, {
      shallow: true,
    });
  }

  const handleClickOnTab = (index: number) => {
    const tab = settingTabList.at(index);
    router.push(`/${SETTINGS}/${tab?.path}`);
  };

  return (
    <>
      <div className="pb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Settings
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Lorem ipsum dolor sit amet consectetur adipisicing elit quam corrupti
          consectetur.
        </p>
      </div>
      <div className="pb-5 border-gray-200 sm:pb-0">
        <Tab.Group selectedIndex={_selectedIndex} onChange={handleClickOnTab}>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <Tab.List
                as="nav"
                className="flex -mb-px space-x-8"
                aria-label="Tabs"
              >
                {settingTabList.map((tab, index) => (
                  <Tab
                    key={tab.id}
                    as={Link}
                    href={`/${SETTINGS}/${tab?.path}`}
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
          <Tab.Panels className="pb-3 mb-3 rounded-md bg-base-200 text-base-content">
            <Tab.Panel className="focus-visible:outline-0">
              <Account />
            </Tab.Panel>
            <Tab.Panel className="focus-visible:outline-0">
              <TeamMembers />
            </Tab.Panel>
            <Tab.Panel className="focus-visible:outline-0">
              <Integrations />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}
