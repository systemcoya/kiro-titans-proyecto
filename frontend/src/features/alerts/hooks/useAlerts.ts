import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { Alert, AlertRule } from '@/types';

interface AlertsActiveResponse {
  alerts: Alert[];
  total: number;
}

interface AlertHistoryResponse {
  alerts: Alert[];
  total: number;
  page: number;
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async (): Promise<AlertsActiveResponse> => {
      const { data } = await apiClient.get<AlertsActiveResponse>('/alerts/active');
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAlertRules() {
  return useQuery({
    queryKey: ['alerts', 'rules'],
    queryFn: async (): Promise<AlertRule[]> => {
      const { data } = await apiClient.get<AlertRule[]>('/alerts/rules');
      return data;
    },
  });
}

export function useAlertHistory(page: number = 1) {
  return useQuery({
    queryKey: ['alerts', 'history', page],
    queryFn: async (): Promise<AlertHistoryResponse> => {
      const { data } = await apiClient.get<AlertHistoryResponse>('/alerts/history', { params: { page } });
      return data;
    },
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post('/alerts/rules', rule);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/alerts/rules/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
