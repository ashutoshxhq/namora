import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { UserProvider } from "@/auth0";

import {
  queryClient,
  QueryClientProvider,
  ReactQueryDevtools,
} from "@/react-query";
import MainLayout from "@/design-system/layouts/primary";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  const { user } = pageProps;
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <UserProvider user={user}>
        <div className={`${inter.className}`}>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </div>
      </UserProvider>
    </QueryClientProvider>
  );
}
