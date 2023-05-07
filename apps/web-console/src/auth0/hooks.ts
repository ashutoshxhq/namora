import { useQuery } from "@/react-query";
import { getAccessToken } from "./api";
import { QUERY_KEY_ACCESS_TOKEN } from "./constants";

export const useFetchAccessToken = () => {
  const { data, isLoading, isFetched } = useQuery(
    [...QUERY_KEY_ACCESS_TOKEN],
    () => getAccessToken(),
    {
      staleTime: Infinity,
    }
  );

  return {
    data,
    isLoading,
    isFetched,
  };
};
