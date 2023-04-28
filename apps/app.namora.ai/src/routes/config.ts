import {
  ChatBubbleBottomCenterIcon,
  RectangleStackIcon,
  Cog8ToothIcon,
} from "@/heroicons";
import { CHATS, JOBS, SETTINGS } from "./constants";

export const navigation = [
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
      pathname: `/${SETTINGS}`,
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
