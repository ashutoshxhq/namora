import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";

import { settingTabList } from "@/routes/config";
import { SETTINGS } from "@/routes/constants";
import { TabLink } from "@/components/settings/tab-link";
import { Alert } from "@/design-system/molecules/alert";

export const TabLayout = ({ children }: any) => {
  const router = useRouter();
  const { pathname } = router;
  return (
    <div>
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
                const isSelected = pathname === `/${SETTINGS}/${tab.path}`;
                return (
                  <TabLink
                    key={tab.id}
                    as={Link}
                    href={`/${SETTINGS}/${tab?.path}`}
                    title={tab.name}
                    isSelected={isSelected}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      {children}
      <Alert />
    </div>
  );
};
