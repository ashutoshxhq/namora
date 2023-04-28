// pages/jobs/ui/[tab].tsx
import { Tab } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { tabs } from "../config";
import { OVERVIEW } from "../constants";
import { classNames } from "@/utils";
import Feed from "./feed";
import ReviewTable from "./review-table";

const JobPage = () => {
  const router = useRouter();
  const _selectedTab = (router?.query?.tab as string) ?? OVERVIEW;
  const selectedIndex = tabs.map((tab) => tab.id).indexOf(_selectedTab) ?? 0;
  const { jId } = router.query;
  console.log("JobPage", { router, jId, _selectedTab });

  if (!router.isReady) {
    return null;
  }
  return (
    <>
      <div>{jId}</div>
      <Tab.Group
        selectedIndex={selectedIndex}
        onChange={(index) => {
          const tab = tabs.at(index);
          router.replace(`/jobs/${jId}/${tab?.name}`, undefined, {
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
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  as={Link}
                  href={`/jobs/${jId}/${tab?.name}`}
                  shallow
                  className={classNames(
                    tab.current
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
            <Feed />
          </Tab.Panel>
          <Tab.Panel>
            <ReviewTable />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div>
        {/* {typeof window !== "undefined" && (
          <pre>Current Location : {window.location.href}</pre>
        )} */}
      </div>
    </>
  );
};
export default JobPage;
