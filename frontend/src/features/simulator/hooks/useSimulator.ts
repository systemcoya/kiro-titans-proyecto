import { useMutation } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import type { SimulationRequest, SimulationResponse } from '@/types';

/**
 * Mutation hook for running what-if projections.
 */
export function useSimulation() {
  return useMutation({
    mutationFn: async (request: SimulationRequest): Promise<SimulationResponse> => {
      const { data } = await apiClient.post<SimulationResponse>('/simulator/projection', request);
      return data;
    },
  });
}
