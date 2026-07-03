import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface AISpendItem {
  mes: string;
  proveedor: string;
  servicioAI: string;
  centroCostos: string;
  producto: string;
  llamadasApi: number;
  tokensConsumidos: number;
  costoAiUsd: number;
  aplicacion: string;
}

interface AISpendResponse {
  data: AISpendItem[];
  count: number;
}

/**
 * Fetches AI spend data from Google Sheets endpoint (real data).
 */
const fetchAISpend = async (): Promise<AISpendResponse> => {
  const { data } = await apiClient.get<AISpendResponse>('/sheets/ai-costs');
  return data;
};

/**
 * React Query hook for AI spend data from Google Sheets.
 */
export function useAISpend() {
  return useQuery({
    queryKey: ['ai-spend-sheets'],
    queryFn: fetchAISpend,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { AISpendItem, AISpendResponse };
