import { Tab } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";

import { classNames } from "@/utils";
import { JOBS, NOT_FOUND } from "@/routes/constants";
import { jobTabList } from "@/routes/config";
import { Plan, Artifact } from "@/components/review-jobs";

const JobPage = () => {
  const router = useRouter();
  const _selectedTab = router?.query?.tab as string;
  const _selectedIndex =
    jobTabList.map((tab) => tab.id).indexOf(_selectedTab) ?? 0;
  const { jobId } = router.query;

  if (!router.isReady) {
    return null;
  }
  if (router.isReady && _selectedIndex === -1) {
    router?.replace(`/${JOBS}/${jobId}/${NOT_FOUND}`, undefined, {
      shallow: true,
    });
  }
  return (
    <>
      <div className="pb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          {jobId}
        </h3>
        <p className="mt-1 text-xs text-gray-500">...</p>
      </div>
      <Tab.Group
        selectedIndex={_selectedIndex}
        onChange={(index) => {
          const tab = jobTabList.at(index);
          router.push(`/${JOBS}/${jobId}/${tab?.path}`);
        }}
      >
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <Tab.List
              as="nav"
              className="flex -mb-px space-x-8"
              aria-label="Tabs"
            >
              {jobTabList.map((tab, index) => (
                <Tab
                  key={tab.id}
                  as={Link}
                  href={`/${JOBS}/${jobId}/${tab?.path}`}
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
        <Tab.Panels className="pb-3 my-3 rounded-md bg-base-200 text-base-content">
          <Tab.Panel className="focus-visible:outline-0">
            <Plan />
          </Tab.Panel>
          <Tab.Panel className="focus-visible:outline-0">
            <Artifact />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};
export default JobPage;
