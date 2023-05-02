import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

import MainLayout from "design-system/layouts/primary";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`bg-slate-50 ${inter.className}`}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </div>
  );
}
