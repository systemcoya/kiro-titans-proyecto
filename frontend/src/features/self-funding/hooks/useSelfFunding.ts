import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { SelfFundingResponse } from '@/types';

export function useSelfFunding(period: string) {
  return useQuery({
    queryKey: ['self-funding', period],
    queryFn: async (): Promise<SelfFundingResponse> => {
      const { data } = await apiClient.get<SelfFundingResponse>('/self-funding', { params: { period } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
