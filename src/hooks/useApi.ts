import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

export function useApi() {
  const { token } = useAuth();

  useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  return apiClient;
}
