import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { CostAvoidanceAction } from '@/types';

interface CostAvoidanceResponse {
  actions: CostAvoidanceAction[];
  totalSavings: number;
}

export function useCostAvoidance(month: string) {
  return useQuery({
    queryKey: ['cost-avoidance', month],
    queryFn: async (): Promise<CostAvoidanceResponse> => {
      const { data } = await apiClient.get<CostAvoidanceResponse>('/cost-avoidance', { params: { month } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
