import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

export interface DashboardFilters {
  month?: string;
  provider?: string;
  product?: string;
}

export function useExecutiveDashboard(filters?: DashboardFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['executive', 'dashboard', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.month) params.append('month', filters.month);
      if (filters?.provider) params.append('provider', filters.provider);
      if (filters?.product) params.append('product', filters.product);

      const { data } = await apiClient.get(`/executive/dashboard?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 min antes de considerar "viejo"
    gcTime: 1000 * 60 * 10, // 10 min en caché
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['executive', 'dashboard'] });
  };

  return { ...query, refreshData };
}
