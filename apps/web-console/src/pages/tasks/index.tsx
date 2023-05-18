import { AI, TASKS } from "@/routes/constants";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function Tasks() {
  const router = useRouter();

  useEffect(() => {
    if (router.asPath === `/${TASKS}`) {
      router.push(decodeURIComponent(`/${TASKS}/${AI}`));
    }
  }, [router]);

  return <div>Tasks</div>;
}
