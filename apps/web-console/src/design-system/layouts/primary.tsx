import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { Sidebar, SidebarMobile, TopBar } from "@/design-system/molecules";
import { NotificationStoreProvider } from "@/contexts/notification";
import { Alert } from "@/design-system/molecules/alert";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function MainLayout({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const {error, isLoading} = useUser();
  console.log(error, isLoading)
  const [pageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsPageLoading(true);
    const handleComplete = () => setIsPageLoading(false);
    const handleError = () => setIsPageLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
    };
  }, [router]);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const sidebarProps = {
    sidebarOpen,
    setSidebarOpen,
  };

  const topBarProps = {
    pageLoading,
    setSidebarOpen,
  };

  return (
    <NotificationStoreProvider>
      <div className="flex flex-col">
        <Sidebar />
        <SidebarMobile {...sidebarProps} />
        <TopBar {...topBarProps} />
        <div className="lg:pl-20">
          <main>
            <div className="p-4 sm:px-6 lg:px-6">{children}</div>
            <Alert />
          </main>
        </div>
      </div>
    </NotificationStoreProvider>
  );
}
