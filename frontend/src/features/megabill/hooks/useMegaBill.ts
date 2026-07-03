import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface MegaBillItem {
  mes: string;
  serviceName: string;
  provider: string;
  category: 'ai' | 'cloud' | 'saas';
  billedCostUsd: number;
  producto: string;
  centroCostos: string;
}

interface MegaBillResponse {
  data: MegaBillItem[];
  count: number;
}

/**
 * Fetches consolidated MegaBill from Google Sheets (AI + Infra + Other).
 */
export function useMegaBill() {
  return useQuery({
    queryKey: ['megabill-sheets'],
    queryFn: async (): Promise<MegaBillResponse> => {
      const { data } = await apiClient.get<MegaBillResponse>('/sheets/megabill');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { MegaBillItem, MegaBillResponse };
