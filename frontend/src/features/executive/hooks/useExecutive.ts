import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['executive', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/executive/dashboard');
      return data;
    },
  });
}
