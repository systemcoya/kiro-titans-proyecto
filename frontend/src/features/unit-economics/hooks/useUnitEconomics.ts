import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

export function useUnitEconomics(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['unit-economics', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/costs/unit-economics', { params });
      return data;
    },
  });
}
