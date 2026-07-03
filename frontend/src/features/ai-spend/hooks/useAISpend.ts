import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { AISpendResponse, CostFilters } from '@/types';

/**
 * Fetches AI spend data with the given filters.
 */
const fetchAISpend = async (filters: Partial<CostFilters> & { groupBy?: string }): Promise<AISpendResponse> => {
  const params: Record<string, string> = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.team) params.team = filters.team;
  if (filters.provider) params.provider = filters.provider;
  if (filters.groupBy) params.groupBy = filters.groupBy;

  const { data } = await apiClient.get<AISpendResponse>('/costs/ai-spend', { params });
  return data;
};

/**
 * React Query hook for AI spend data.
 */
export function useAISpend(filters: Partial<CostFilters> & { groupBy?: string }) {
  return useQuery({
    queryKey: ['ai-spend', filters],
    queryFn: () => fetchAISpend(filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Mutation hook for temporal advance (simulates +1 hour of consumption).
 */
export function useAdvanceTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/costs/ai-spend/advance');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-spend'] });
    },
  });
}
