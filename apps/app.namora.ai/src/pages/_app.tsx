import "@/styles/globals.css";
import type { AppProps } from "next/app";

import MainLayout from "design-system/layouts/primary";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
