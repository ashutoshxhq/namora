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

export const sideBarMenuList = [
  {
    id: CHATS,
    name: CHATS,
    href: {
      pathname: `/${CHATS}`,
      query: {},
    },
    icon: ChatBubbleBottomCenterIcon,
    current: false,
  },
  {
    id: JOBS,
    name: JOBS,
    href: {
      pathname: `/${JOBS}`,
      query: {},
    },
    icon: RectangleStackIcon,
    current: false,
  },
  {
    id: SETTINGS,
    name: SETTINGS,
    href: {
      pathname: `/${SETTINGS}/${ACCOUNT}`,
      query: {},
    },
    icon: Cog8ToothIcon,
    current: false,
  },
];

export const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

export const jobTabList = [
  {
    id: PLAN,
    name: PLAN,
    href: {
      pathname: `/${PLAN}`,
      query: {},
    },
    current: false,
  },
  {
    id: ARTIFACT,
    name: ARTIFACT,
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
    name: ACCOUNT,
    href: {
      pathname: `${SETTINGS}/${ACCOUNT}`,
      query: {},
    },
    current: false,
  },
  {
    id: TEAM_MEMBERS,
    name: TEAM_MEMBERS,
    href: {
      pathname: `${SETTINGS}/${TEAM_MEMBERS}`,
      query: {},
    },
    current: false,
  },
  {
    id: INTEGRATIONS,
    name: INTEGRATIONS,
    href: {
      pathname: `${SETTINGS}/${INTEGRATIONS}`,
      query: {},
    },
    current: false,
  },
];
