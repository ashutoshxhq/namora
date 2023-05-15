import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { UserProvider } from "@/auth0";

import {
  QueryClientProvider,
  ReactQueryDevtools,
  Hydrate,
  queryClient,
} from "@/react-query";
import MainLayout from "@/design-system/layouts/primary";
import { ReactElement, ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

type NextPageWithLayout = AppProps & {
  Component: { getLayout?: (page: ReactElement) => ReactNode };
};

export default function App({ Component, pageProps }: NextPageWithLayout) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <UserProvider>
        <Hydrate state={pageProps.dehydratedState}>
          <div className={`${inter.className}`}>
            <MainLayout>
              <Component {...pageProps.session} />
            </MainLayout>
          </div>
        </Hydrate>
      </UserProvider>
    </QueryClientProvider>
  );
}
