import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import MainLayout from "@/design-system/layouts/primary";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className={`${inter.className}`}>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </div>
    </UserProvider>
  );
}
