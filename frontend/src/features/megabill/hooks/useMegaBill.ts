import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

export function useMegaBill() {
  return useQuery({
    queryKey: ['megabill'],
    queryFn: async () => {
      const { data } = await apiClient.get('/costs/megabill');
      return data;
    },
  });
}

export function useMegaBillDrillDown(category: string | null) {
  return useQuery({
    queryKey: ['megabill-drilldown', category],
    queryFn: async () => {
      const { data } = await apiClient.get(`/costs/megabill/${category}`);
      return data;
    },
    enabled: !!category,
  });
}
