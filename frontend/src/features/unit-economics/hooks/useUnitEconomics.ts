import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { UnitEconomicsRow } from '@/types';

interface UnitEconomicsResponse {
  data: UnitEconomicsRow[];
  period: { startDate: string; endDate: string };
}

interface UnitEconomicsParams {
  period?: 'week' | 'month';
  startDate?: string;
  endDate?: string;
}

/**
 * Fetches unit economics data for the specified period.
 */
const fetchUnitEconomics = async (params: UnitEconomicsParams): Promise<UnitEconomicsResponse> => {
  const queryParams: Record<string, string> = {};
  if (params.period) queryParams.period = params.period;
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;

  const { data } = await apiClient.get<UnitEconomicsResponse>('/costs/unit-economics', { params: queryParams });
  return data;
};

/**
 * React Query hook for unit economics data.
 */
export function useUnitEconomics(params: UnitEconomicsParams) {
  return useQuery({
    queryKey: ['unit-economics', params],
    queryFn: () => fetchUnitEconomics(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
