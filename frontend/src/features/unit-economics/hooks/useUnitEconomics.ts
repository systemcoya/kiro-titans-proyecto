import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface UnitEconomicsItem {
  mes: string;
  producto: string;
  totalCostAiUsd: number;
  polizasEmitidas: number;
  primasEmitidasUsd: number;
  costoPorPolizaUsd: number | null;
  costoPorPolizaCop: number | null;
}

interface UnitEconomicsResponse {
  data: UnitEconomicsItem[];
  count: number;
}

/**
 * Fetches unit economics from Google Sheets (real data).
 */
export function useUnitEconomics() {
  return useQuery({
    queryKey: ['unit-economics-sheets'],
    queryFn: async (): Promise<UnitEconomicsResponse> => {
      const { data } = await apiClient.get<UnitEconomicsResponse>('/sheets/unit-economics');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { UnitEconomicsItem, UnitEconomicsResponse };
