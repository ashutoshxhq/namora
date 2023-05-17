import { ReactNode } from "react";

export type TNotificationStoreProvider = {
  children: ReactNode;
};

export type TNotificationState = {
  isShow: boolean;
  title: string;
  description: string;
  status: string;
};
