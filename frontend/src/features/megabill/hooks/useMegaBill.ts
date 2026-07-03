import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface MegaBillCategory {
  category: string;
  totalCost: number;
  percentage: number;
}

interface MegaBillResponse {
  totalCost: number;
  categories: MegaBillCategory[];
}

interface DrillDownService {
  serviceName: string;
  billedCost: number;
  usageQuantity: number;
  provider: string;
}

interface DrillDownResponse {
  category: string;
  totalCost: number;
  services: DrillDownService[];
}

/**
 * React Query hook for MegaBill summary data.
 */
export function useMegaBill() {
  return useQuery({
    queryKey: ['megabill'],
    queryFn: async (): Promise<MegaBillResponse> => {
      const { data } = await apiClient.get<MegaBillResponse>('/costs/megabill');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * React Query hook for MegaBill drill-down by category.
 */
export function useMegaBillDrillDown(category: string | null) {
  return useQuery({
    queryKey: ['megabill-drilldown', category],
    queryFn: async (): Promise<DrillDownResponse> => {
      const { data } = await apiClient.get<DrillDownResponse>(`/costs/megabill/${category}`);
      return data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}

export type { MegaBillCategory, MegaBillResponse, DrillDownService, DrillDownResponse };
