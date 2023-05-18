import { InboxStackIcon } from "@heroicons/react/24/outline";
import {
  JOBS,
  SETTINGS,
  PLAN,
  ARTIFACT,
  ACCOUNT,
  TEAM_MEMBERS,
  INTEGRATIONS,
  ROOT,
  TASKS,
  AI,
} from "./constants";

import {
  ChatBubbleBottomCenterIcon,
  RectangleStackIcon,
  Cog8ToothIcon,
} from "@/heroicons";

const routeNameMap = {
  [ROOT]: "",
  [JOBS]: "Review Jobs",
  [SETTINGS]: "Settings",
  [TEAM_MEMBERS]: "Team Members",
  [PLAN]: "Plans",
  [ARTIFACT]: "Artifacts",
  [ACCOUNT]: "Account",
  [INTEGRATIONS]: "Integrations",
  [TASKS]: "Tasks",
  [AI]: "ai",
};

export const sideBarMenuList = [
  {
    id: ROOT,
    name: routeNameMap[ROOT],
    path: ROOT,
    href: {
      pathname: `/${ROOT}`,
      query: {},
    },
    icon: ChatBubbleBottomCenterIcon,
  },
  {
    id: TASKS,
    name: routeNameMap[TASKS],
    path: TASKS,
    href: {
      pathname: `/${TASKS}/${AI}`,
      query: {},
    },
    icon: InboxStackIcon,
  },
  {
    id: JOBS,
    name: routeNameMap[JOBS],
    path: JOBS,
    href: {
      pathname: `/${JOBS}`,
      query: {},
    },
    icon: RectangleStackIcon,
  },
  {
    id: SETTINGS,
    name: routeNameMap[SETTINGS],
    path: SETTINGS,
    href: {
      pathname: decodeURIComponent(`/${SETTINGS}/${ACCOUNT}`),
      query: {},
    },
    icon: Cog8ToothIcon,
  },
];

export const userNavigation = [
  {
    name: "Your profile",
    href: decodeURIComponent(`/${SETTINGS}/${ACCOUNT}`),
  },
  { name: "Sign out", href: "/api/auth/logout" },
];

export const jobTabList = [
  {
    id: PLAN,
    name: routeNameMap[PLAN],
    path: PLAN,
    href: {
      pathname: `/${PLAN}`,
      query: {},
    },
  },
  {
    id: ARTIFACT,
    name: routeNameMap[ARTIFACT],
    path: ARTIFACT,
    href: {
      pathname: `/${ARTIFACT}`,
      query: {},
    },
  },
];

export const settingTabList = [
  {
    id: ACCOUNT,
    name: routeNameMap[ACCOUNT],
    path: ACCOUNT,
    href: {
      pathname: decodeURIComponent(`${SETTINGS}/${ACCOUNT}`),
      query: {},
    },
  },
  {
    id: TEAM_MEMBERS,
    name: routeNameMap[TEAM_MEMBERS],
    path: TEAM_MEMBERS,
    href: {
      pathname: decodeURIComponent(`${SETTINGS}/${TEAM_MEMBERS}`),
      query: {},
    },
  },
  {
    id: INTEGRATIONS,
    name: routeNameMap[INTEGRATIONS],
    path: INTEGRATIONS,
    href: {
      pathname: decodeURIComponent(`${SETTINGS}/${INTEGRATIONS}`),
      query: {},
    },
  },
];
