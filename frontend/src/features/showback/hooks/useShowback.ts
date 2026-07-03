import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { ShowbackRow } from '@/types';

interface ShowbackResponse {
  teams: (ShowbackRow & { overBudget: boolean })[];
  ranking: (ShowbackRow & { overBudget: boolean })[];
}

/**
 * Fetches showback data for a given month.
 */
export function useShowback(month: string) {
  return useQuery({
    queryKey: ['showback', month],
    queryFn: async (): Promise<ShowbackResponse> => {
      const { data } = await apiClient.get<ShowbackResponse>('/costs/showback', {
        params: { month },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
