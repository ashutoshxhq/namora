import { useState } from "react";
import { Sidebar, SidebarMobile, TopBar } from "@/design-system/molecules";

export default function MainLayout({ children }: { children: JSX.Element }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const sidebarProps = {
    sidebarOpen,
    setSidebarOpen,
  };

  return (
    <div className="flex flex-col">
      <Sidebar />
      <SidebarMobile {...sidebarProps} />
      <TopBar setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-20">
        <main>
          <div className="p-4 sm:px-6 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
