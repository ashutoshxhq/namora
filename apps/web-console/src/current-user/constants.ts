import { UserCircleIcon } from "@heroicons/react/24/outline";

export const currentUserEntityKey = "team-member";

export const userObjNameMap: { [key: string]: string } = {
  [currentUserEntityKey]: "Team members",
  "": "Choose a team member",
};
export const userObjIconMap: { [key: string]: any } = {
  "": UserCircleIcon,
  [currentUserEntityKey]: UserCircleIcon,
};
