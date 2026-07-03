import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { GovernanceRule, Recommendation } from '@/types';

interface RecommendationsResponse {
  recommendations: Recommendation[];
  totalEstimatedSavings: number;
}

export function useGovernanceRules() {
  return useQuery({
    queryKey: ['governance', 'rules'],
    queryFn: async (): Promise<GovernanceRule[]> => {
      const { data } = await apiClient.get<GovernanceRule[]>('/governance/rules');
      return data;
    },
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['governance', 'recommendations'],
    queryFn: async (): Promise<RecommendationsResponse> => {
      const { data } = await apiClient.get<RecommendationsResponse>('/governance/recommendations');
      return data;
    },
  });
}

export function useCreateGovernanceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Omit<GovernanceRule, 'id'>) => {
      const { data } = await apiClient.post('/governance/rules', rule);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['governance'] }),
  });
}

export function useImplementRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/governance/recommendations/${id}/implement`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['governance'] }),
  });
}
