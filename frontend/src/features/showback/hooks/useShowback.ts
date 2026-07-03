import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

export function useShowback(month?: string) {
  return useQuery({
    queryKey: ['showback', month],
    queryFn: async () => {
      const { data } = await apiClient.get('/costs/showback', { params: month ? { month } : {} });
      return data;
    },
  });
}
