import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  useQuery,
  useQueries,
  useMutation,
  dehydrate,
  Hydrate,
} from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  Persister,
  persistQueryClient,
} from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

let localStoragePersister: Persister = createSyncStoragePersister({
  storage: null,
});
if (typeof window !== "undefined") {
  localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
  });
}

// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

export {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  ReactQueryDevtools,
  dehydrate,
  Hydrate,
};
