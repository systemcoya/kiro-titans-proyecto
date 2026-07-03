import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface SelfFundingData {
  aiCosts: Array<{ mes: string; costoAiUsd: number }>;
  infraCosts: Array<{ mes: string; costoInfraUsd: number }>;
  otherCosts: Array<{ mes: string; costoTotalUsd: number }>;
  syncedAt: string;
}

/**
 * Fetches data from Google Sheets to compute self-funding ratio.
 * Uses AI costs as "investment" and infra optimization as "savings potential".
 */
export function useSelfFunding() {
  return useQuery({
    queryKey: ['self-funding-sheets'],
    queryFn: async (): Promise<SelfFundingData> => {
      const { data } = await apiClient.get<SelfFundingData>('/sheets/sync');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { SelfFundingData };
