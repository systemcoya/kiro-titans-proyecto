import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface SyncData {
  aiCosts: Array<{ mes: string; proveedor: string; costoAiUsd: number; tokensConsumidos: number; llamadasApi: number; servicioAI: string; producto: string }>;
  infraCosts: Array<{ mes: string; proveedor: string; costoInfraUsd: number; servicio: string; producto: string }>;
  otherCosts: Array<{ mes: string; proveedor: string; costoTotalUsd: number; conceptoGasto: string; producto: string }>;
  policies: Array<{ mes: string; producto: string; polizasEmitidas: number; primasEmitidasUsd: number }>;
  syncedAt: string;
}

/**
 * Fetches all data from Google Sheets for the executive dashboard.
 */
export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['executive-sheets'],
    queryFn: async (): Promise<SyncData> => {
      const { data } = await apiClient.get<SyncData>('/sheets/sync');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { SyncData };
