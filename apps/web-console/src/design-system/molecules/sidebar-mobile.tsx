import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@/heroicons";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import { sideBarMenuList } from "@/routes/config";
import { CHATS, ROOT, SETTINGS } from "@/routes/constants";
import { classNames } from "@/utils";

export const SidebarMobile = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (data: boolean) => void;
}) => {
  const router = useRouter();
  const _selectedTab = router?.asPath as string;
  let replacedTabStr = _selectedTab?.replace("/", "");
  if (replacedTabStr.startsWith(SETTINGS)) {
    replacedTabStr = `${SETTINGS}`;
  }
  const _selectedIndex =
    sideBarMenuList.map((tab) => tab.id).indexOf(replacedTabStr) ?? 0;
  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50 lg:hidden"
        onClose={setSidebarOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex flex-1 w-full max-w-xs mr-16">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex flex-col px-6 pb-2 overflow-y-auto bg-gray-900 grow gap-y-5 ring-1 ring-white/10">
                <div className="flex items-center justify-start h-16 shrink-0">
                  <Link href={`/${CHATS}`}>
                    <Image
                      className="w-auto h-8"
                      src="https://assets.namora.ai/namora-white.svg"
                      title="Namora.ai"
                      alt="Your Company"
                      width="100"
                      height="100"
                    />
                  </Link>
                </div>
                <nav className="flex flex-col flex-1">
                  <ul role="list" className="flex-1 -mx-2 space-y-1">
                    {sideBarMenuList
                      .filter((tab) => tab.id !== ROOT)
                      .map((item, index) => {
                        const decodedURI = decodeURIComponent(
                          item.href.pathname
                        );

                        return (
                          <li key={item.id}>
                            <Link
                              href={decodedURI}
                              className={classNames(
                                _selectedIndex === index
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                              )}
                            >
                              <item.icon
                                className="w-6 h-6 shrink-0"
                                aria-hidden="true"
                              />
                              <p className="capitalize"> {item.name}</p>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
