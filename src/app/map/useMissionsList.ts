import { useApi } from "@/hooks/useApi";
import { MissionsListResponse } from "@/types/api";
import { useEffect, useState } from "react";

export default function useMissionsList() {
  const api = useApi();
  const [missions, setMissions] = useState<MissionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.getMissionsList({
          lnt: 123.456,
          lat: 23.456,
        });
        setMissions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch missions"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  return { missions, error, loading };
}
