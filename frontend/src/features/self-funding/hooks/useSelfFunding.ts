import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

export function useSelfFunding(period?: string) {
  return useQuery({
    queryKey: ['self-funding', period],
    queryFn: async () => {
      const { data } = await apiClient.get('/self-funding', { params: period ? { period } : {} });
      return data;
    },
  });
}
