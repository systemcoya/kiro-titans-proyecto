import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface ExecutiveDashboard {
  currentMonthSpend: number;
  previousMonthSpend: number | null;
  variationPercentage: number | null;
  top5Services: { name: string; cost: number }[];
  avgCostPerTransaction: number;
  criticalAlertsCount: number;
  monthlyTrend: { month: string; amount: number }[];
}

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['executive', 'dashboard'],
    queryFn: async (): Promise<ExecutiveDashboard> => {
      const { data } = await apiClient.get<ExecutiveDashboard>('/executive/dashboard');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export type { ExecutiveDashboard };
