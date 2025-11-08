import useSWR from "swr";

export default function useMissionsList() {
  const { data, error, isLoading } = useSWR("/api/missions/list");

  return { data, error, isLoading };
}
