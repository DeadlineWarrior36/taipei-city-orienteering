import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function useUserPoints(userId: string | null) {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserPoints = async () => {
      try {
        setLoading(true);
        const userInfo = await apiClient.getUserInfo(userId);
        setPoints(userInfo.total_points ?? 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setPoints(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    try {
      const userInfo = await apiClient.getUserInfo(userId);
      setPoints(userInfo.total_points);
    } catch (err) {
      console.error('Failed to refetch user points:', err);
    }
  };

  return { points, loading, error, refetch };
}
