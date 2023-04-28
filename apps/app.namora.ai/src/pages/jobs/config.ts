import { OVERVIEW, REVIEW } from "./constants";

export const tabs = [
  {
    id: OVERVIEW,
    name: OVERVIEW,
    href: {
      pathname: `/${OVERVIEW}`,
      query: {},
    },
    current: false,
  },
  {
    id: REVIEW,
    name: REVIEW,
    href: {
      pathname: `/${REVIEW}`,
      query: {},
    },
    current: false,
  },
];
