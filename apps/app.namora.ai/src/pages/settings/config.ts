import {
  SETTINGS,
  ACCOUNT,
  TEAM_MEMBERS,
  INTEGRATIONS,
} from "settings/constants";

export const tabs = [
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
