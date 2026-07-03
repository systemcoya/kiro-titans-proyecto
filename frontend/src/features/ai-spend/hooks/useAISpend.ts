import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

const fetchAISpend = async (filters: Record<string, string> = {}) => {
  const { data } = await apiClient.get('/costs/ai-spend', { params: filters });
  return data;
};

export function useAISpend(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['ai-spend', filters],
    queryFn: () => fetchAISpend(filters),
  });
}

export function useAdvanceTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/costs/ai-spend/advance');
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-spend'] }); },
  });
}
