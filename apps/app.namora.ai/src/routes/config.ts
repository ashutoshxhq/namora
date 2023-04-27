import {
  ChatBubbleBottomCenterIcon,
  RectangleStackIcon,
  Cog8ToothIcon,
} from "@/heroicons";
import { CHATS, JOBS, SETTINGS } from "./constants";

export const navigation = [
  {
    name: CHATS,
    href: CHATS,
    icon: ChatBubbleBottomCenterIcon,
    current: false,
  },
  { name: JOBS, href: JOBS, icon: RectangleStackIcon, current: false },
  {
    name: SETTINGS,
    href: SETTINGS,
    icon: Cog8ToothIcon,
    current: false,
  },
];

export const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];
