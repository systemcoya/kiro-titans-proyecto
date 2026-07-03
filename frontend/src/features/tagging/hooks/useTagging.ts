import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

interface ResourceTag {
  id: string;
  resourceId: string;
  team: string | null;
  project: string | null;
  environment: string | null;
  aiUseCase: string | null;
}

interface ComplianceResponse {
  compliancePercentage: number;
  totalResources: number;
  compliantResources: number;
}

export function useResourceTags() {
  return useQuery({
    queryKey: ['tagging', 'resources'],
    queryFn: async (): Promise<ResourceTag[]> => {
      const { data } = await apiClient.get<ResourceTag[]>('/tagging/resources');
      return data;
    },
  });
}

export function useTaggingCompliance() {
  return useQuery({
    queryKey: ['tagging', 'compliance'],
    queryFn: async (): Promise<ComplianceResponse> => {
      const { data } = await apiClient.get<ComplianceResponse>('/tagging/compliance');
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export type { ResourceTag, ComplianceResponse };
