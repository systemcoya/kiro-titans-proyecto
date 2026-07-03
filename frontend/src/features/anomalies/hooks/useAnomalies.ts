import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { AnomalyAlert } from '@/types';

export function useAnomalies() {
  return useQuery({
    queryKey: ['anomalies'],
    queryFn: async (): Promise<AnomalyAlert[]> => {
      const { data } = await apiClient.get<AnomalyAlert[]>('/anomalies');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
