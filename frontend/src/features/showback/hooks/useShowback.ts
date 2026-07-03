import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface InfraCostItem {
  mes: string;
  proveedor: string;
  servicio: string;
  costoInfraUsd: number;
  aplicacion: string;
  producto: string;
  centroCostos: string;
}

interface ShowbackResponse {
  data: InfraCostItem[];
  count: number;
}

/**
 * Fetches infrastructure costs from Google Sheets for showback view.
 * Groups by Centro de Costos (proxy for team/cell).
 */
export function useShowback() {
  return useQuery({
    queryKey: ['showback-sheets'],
    queryFn: async (): Promise<ShowbackResponse> => {
      const { data } = await apiClient.get<ShowbackResponse>('/sheets/infra-costs');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { InfraCostItem, ShowbackResponse };
