import { PLAN, ARTIFACT } from "./constants";

export const tabs = [
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
