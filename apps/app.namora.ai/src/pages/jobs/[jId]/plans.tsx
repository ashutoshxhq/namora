import { useRouter } from "next/router";
import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import { tabs } from "../config";
import { PLAN } from "../constants";
import { classNames } from "@/utils";

const timeline = [
  {
    id: 1,
    content: "Applied to",
    target: "Front End Developer",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: UserIcon,
    iconBackground: "bg-gray-400",
  },
  {
    id: 2,
    content: "Advanced to phone screening by",
    target: "Bethany Blake",
    href: "#",
    date: "Sep 22",
    datetime: "2020-09-22",
    icon: HandThumbUpIcon,
    iconBackground: "bg-blue-500",
  },
  {
    id: 3,
    content: "Completed phone screening with",
    target: "Martha Gardner",
    href: "#",
    date: "Sep 28",
    datetime: "2020-09-28",
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
  {
    id: 4,
    content: "Advanced to interview by",
    target: "Bethany Blake",
    href: "#",
    date: "Sep 30",
    datetime: "2020-09-30",
    icon: HandThumbUpIcon,
    iconBackground: "bg-blue-500",
  },
  {
    id: 5,
    content: "Completed interview with",
    target: "Katherine Snyder",
    href: "#",
    date: "Oct 4",
    datetime: "2020-10-04",
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
];

const Plan = () => {
  const router = useRouter();
  const _selectedTab = router?.query?.tab as string;
  const _selectedIndex = tabs.map((tab) => tab.id).indexOf(_selectedTab) ?? 0;
  const { jId } = router.query;

  if (!router.isReady) {
    return null;
  }
  if (router.isReady && (!_selectedTab || _selectedIndex === -1)) {
    router?.replace(`/jobs/${jId}/404`, undefined, {
      shallow: true,
    });
  }
  return (
    <>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {timeline.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== timeline.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={classNames(
                        event.iconBackground,
                        "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                      )}
                    >
                      <event.icon
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        {event.content}{" "}
                        <a
                          href={event.href}
                          className="font-medium text-gray-900"
                        >
                          {event.target}
                        </a>
                      </p>
                    </div>
                    <div className="text-sm text-right text-gray-500 whitespace-nowrap">
                      <time dateTime={event.datetime}>{event.date}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
export default Plan;
