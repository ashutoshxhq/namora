import React from "react";
import Image from "next/image";
import Link from "next/link";

import { sideBarMenuList } from "@/routes/config";
import { classNames } from "@/utils";
import { useRouter } from "next/router";
import { SETTINGS, TASKS } from "@/routes/constants";

export const Sidebar = () => {
  const router = useRouter();
  const _selectedTab = router?.asPath as string;
  let replacedTabStr = _selectedTab?.replace("/", "");
  if (replacedTabStr.startsWith(SETTINGS)) {
    replacedTabStr = `${SETTINGS}`;
  } else if (replacedTabStr.startsWith(TASKS)) {
    replacedTabStr = `${TASKS}`;
  }
  const _selectedIndex =
    sideBarMenuList.map((tab) => tab.id).indexOf(replacedTabStr) ?? 0;

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
      <div className="flex items-center justify-center h-16 shrink-0">
        <Link href={`/`}>
          <Image
            className="w-auto h-7"
            src="https://assets.namora.ai/namora-white.svg"
            title="Namora.ai"
            alt="company logo"
            width="80"
            height="80"
          />
        </Link>
      </div>
      <nav className="mt-8">
        <ul role="list" className="flex flex-col items-center space-y-1">
          {sideBarMenuList.map((item, index) => {
            const decodedURI = decodeURIComponent(item.href.pathname);

            return (
              <li key={item.id}>
                <Link
                  href={decodedURI}
                  className={classNames(
                    _selectedIndex === index
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                    "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold"
                  )}
                >
                  <item.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
