import {
  CHATS,
  JOBS,
  SETTINGS,
  PLAN,
  ARTIFACT,
  ACCOUNT,
  TEAM_MEMBERS,
  INTEGRATIONS,
} from "./constants";

import {
  ChatBubbleBottomCenterIcon,
  RectangleStackIcon,
  Cog8ToothIcon,
} from "@/heroicons";

const routeNameMap = {
  [CHATS]: "Chats",
  [JOBS]: "Review Jobs",
  [SETTINGS]: "Settings",
  [TEAM_MEMBERS]: "Team Members",
  [PLAN]: "Plans",
  [ARTIFACT]: "Artifacts",
  [ACCOUNT]: "Account",
  [INTEGRATIONS]: "Integrations",
};

export const sideBarMenuList = [
  {
    id: CHATS,
    name: routeNameMap[CHATS],
    path: CHATS,
    href: {
      pathname: `/${CHATS}`,
      query: {},
    },
    icon: ChatBubbleBottomCenterIcon,
    current: false,
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
    current: false,
  },
  {
    id: SETTINGS,
    name: routeNameMap[SETTINGS],
    path: SETTINGS,
    href: {
      pathname: `/${SETTINGS}/${ACCOUNT}`,
      query: {},
    },
    icon: Cog8ToothIcon,
    current: false,
  },
];

export const userNavigation = [
  { name: "Your profile", href: `/${SETTINGS}/${ACCOUNT}` },
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
    current: false,
  },
  {
    id: ARTIFACT,
    name: routeNameMap[ARTIFACT],
    path: ARTIFACT,
    href: {
      pathname: `/${ARTIFACT}`,
      query: {},
    },
    current: false,
  },
];

export const settingTabList = [
  {
    id: ACCOUNT,
    name: routeNameMap[ACCOUNT],
    path: ACCOUNT,
    href: {
      pathname: `${SETTINGS}/${ACCOUNT}`,
      query: {},
    },
    current: false,
  },
  {
    id: TEAM_MEMBERS,
    name: routeNameMap[TEAM_MEMBERS],
    path: TEAM_MEMBERS,
    href: {
      pathname: `${SETTINGS}/${TEAM_MEMBERS}`,
      query: {},
    },
    current: false,
  },
  {
    id: INTEGRATIONS,
    name: routeNameMap[INTEGRATIONS],
    path: INTEGRATIONS,
    href: {
      pathname: `${SETTINGS}/${INTEGRATIONS}`,
      query: {},
    },
    current: false,
  },
];
