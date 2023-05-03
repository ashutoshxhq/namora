import { useRouter } from "next/router";
import { CHATS } from "@/routes/constants";

export default function Home() {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }
  if (router.isReady) {
    router?.push(`/${CHATS}`);
  }
  return <></>;
}
