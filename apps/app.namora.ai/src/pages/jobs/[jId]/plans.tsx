// pages/jobs/ui/[tab].tsx
import { Tab } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { tabs } from "../config";
import { PLAN } from "../constants";
import { classNames } from "@/utils";
import Feed from "./feed";

const Plan = () => {
  const router = useRouter();
  const _selectedTab = (router?.query?.tab as string) ?? PLAN;
  const selectedIndex = tabs.map((tab) => tab.id).indexOf(_selectedTab) ?? 0;
  const { jId } = router.query;
  console.log("Plan", { router, jId, _selectedTab });

  if (!router.isReady) {
    return null;
  }
  return (
    <>
      <Feed />
    </>
  );
};
export default Plan;
