'use strict';

const { getAISpend, advanceTime } = require('../../src/services/cost.service');
const costRepository = require('../../src/repositories/cost.repository');
const { validateCostFilters } = require('../../src/validators/cost.validator');

jest.mock('../../src/repositories/cost.repository');

describe('CostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAISpend', () => {
    it('should return totalCost, breakdown with percentages, and filters', async () => {
      // Given
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'service',
      };

      costRepository.getAISpendGrouped.mockResolvedValue({
        rows: [
          { name: 'GPT-4', cost_usd: '600.00', tokens: '500000', inferences: '3000', gpu_hours: '10.50' },
          { name: 'Claude 3.5 Sonnet', cost_usd: '400.00', tokens: '300000', inferences: '2000', gpu_hours: '7.20' },
        ],
      });

      // When
      const result = await getAISpend(filters);

      // Then
      expect(result.totalCost).toBe(1000.00);
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0]).toEqual({
        name: 'GPT-4',
        costUsd: 600.00,
        percentage: 60.00,
        tokens: 500000,
        inferences: 3000,
        gpuHours: 10.50,
        groupBy: 'service',
      });
      expect(result.breakdown[1]).toEqual({
        name: 'Claude 3.5 Sonnet',
        costUsd: 400.00,
        percentage: 40.00,
        tokens: 300000,
        inferences: 2000,
        gpuHours: 7.20,
        groupBy: 'service',
      });
      expect(result.filters).toEqual({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'service',
        team: undefined,
        provider: undefined,
      });
    });

    it('should pass team and provider filters to repository', async () => {
      // Given
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        team: 'Célula Vida Digital',
        provider: 'OpenAI',
        groupBy: 'provider',
      };

      costRepository.getAISpendGrouped.mockResolvedValue({ rows: [] });

      // When
      await getAISpend(filters);

      // Then
      expect(costRepository.getAISpendGrouped).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'provider',
        team: 'Célula Vida Digital',
        provider: 'OpenAI',
      });
    });

    it('should return totalCost 0 and empty breakdown when no rows', async () => {
      // Given
      costRepository.getAISpendGrouped.mockResolvedValue({ rows: [] });

      // When
      const result = await getAISpend({
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        groupBy: 'service',
      });

      // Then
      expect(result.totalCost).toBe(0);
      expect(result.breakdown).toEqual([]);
    });

    it('should calculate percentages that sum to approximately 100%', async () => {
      // Given
      costRepository.getAISpendGrouped.mockResolvedValue({
        rows: [
          { name: 'Service A', cost_usd: '333.33', tokens: '100000', inferences: '500', gpu_hours: '2.00' },
          { name: 'Service B', cost_usd: '333.33', tokens: '100000', inferences: '500', gpu_hours: '2.00' },
          { name: 'Service C', cost_usd: '333.34', tokens: '100000', inferences: '500', gpu_hours: '2.00' },
        ],
      });

      // When
      const result = await getAISpend({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'service',
      });

      // Then
      const totalPercentage = result.breakdown.reduce((sum, item) => sum + item.percentage, 0);
      expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.1);
    });

    it('should handle null consumption metrics gracefully', async () => {
      // Given
      costRepository.getAISpendGrouped.mockResolvedValue({
        rows: [
          { name: 'DALL-E 3', cost_usd: '150.00', tokens: null, inferences: '500', gpu_hours: '3.00' },
        ],
      });

      // When
      const result = await getAISpend({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'service',
      });

      // Then
      expect(result.breakdown[0].tokens).toBeUndefined();
      expect(result.breakdown[0].inferences).toBe(500);
      expect(result.breakdown[0].gpuHours).toBe(3.00);
    });
  });

  describe('advanceTime', () => {
    it('should create one record per service profile', async () => {
      // Given
      costRepository.getServiceProfiles.mockResolvedValue({
        rows: [
          { service_name: 'GPT-4', provider: 'OpenAI', avg_cost: '95.00', avg_tokens: '350000', avg_inferences: '2000', avg_gpu_hours: '1.20' },
          { service_name: 'Claude 3.5 Sonnet', provider: 'Anthropic', avg_cost: '85.00', avg_tokens: '280000', avg_inferences: '1800', avg_gpu_hours: '1.00' },
        ],
      });
      costRepository.getTeamIds.mockResolvedValue({
        rows: [{ id: 'team-id-1' }, { id: 'team-id-2' }],
      });
      costRepository.insertAICost.mockResolvedValue({});

      // When
      const result = await advanceTime();

      // Then
      expect(result.recordsCreated).toBe(2);
      expect(result.records).toHaveLength(2);
      expect(costRepository.insertAICost).toHaveBeenCalledTimes(2);
    });

    it('should generate hourly fraction costs with variation', async () => {
      // Given
      costRepository.getServiceProfiles.mockResolvedValue({
        rows: [
          { service_name: 'GPT-4', provider: 'OpenAI', avg_cost: '96.00', avg_tokens: '240000', avg_inferences: '2400', avg_gpu_hours: '1.20' },
        ],
      });
      costRepository.getTeamIds.mockResolvedValue({
        rows: [{ id: 'team-id-1' }],
      });
      costRepository.insertAICost.mockResolvedValue({});

      // When
      const result = await advanceTime();

      // Then
      const record = result.records[0];
      // Hourly fraction of avg 96 with 0.7-1.3 variation: ~2.8 to ~5.2
      expect(record.costUsd).toBeGreaterThan(0);
      expect(record.costUsd).toBeLessThan(10);
      expect(record.tokens).toBeGreaterThanOrEqual(0);
      expect(record.inferences).toBeGreaterThanOrEqual(0);
      expect(record.gpuHours).toBeGreaterThanOrEqual(0);
    });

    it('should return empty result when no profiles exist', async () => {
      // Given
      costRepository.getServiceProfiles.mockResolvedValue({ rows: [] });
      costRepository.getTeamIds.mockResolvedValue({ rows: [] });

      // When
      const result = await advanceTime();

      // Then
      expect(result.recordsCreated).toBe(0);
      expect(result.records).toEqual([]);
    });

    it('should assign a valid team ID from available teams', async () => {
      // Given
      const teamId = 'fixed-team-id-abc';
      costRepository.getServiceProfiles.mockResolvedValue({
        rows: [
          { service_name: 'Haiku', provider: 'Anthropic', avg_cost: '22.00', avg_tokens: '90000', avg_inferences: '3000', avg_gpu_hours: '0.30' },
        ],
      });
      costRepository.getTeamIds.mockResolvedValue({
        rows: [{ id: teamId }],
      });
      costRepository.insertAICost.mockResolvedValue({});

      // When
      const result = await advanceTime();

      // Then
      expect(result.records[0].teamId).toBe(teamId);
    });
  });
});

describe('CostValidator', () => {
  describe('validateCostFilters', () => {
    it('should validate valid filters with defaults', () => {
      // Given
      const input = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      // When
      const result = validateCostFilters(input);

      // Then
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-01-31');
      expect(result.groupBy).toBe('service');
      expect(result.team).toBeUndefined();
      expect(result.provider).toBeUndefined();
    });

    it('should accept valid provider enum values', () => {
      // Given / When / Then
      expect(() => validateCostFilters({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        provider: 'AWS Bedrock',
      })).not.toThrow();

      expect(() => validateCostFilters({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        provider: 'OpenAI',
      })).not.toThrow();

      expect(() => validateCostFilters({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        provider: 'Anthropic',
      })).not.toThrow();
    });

    it('should reject invalid provider values', () => {
      // Given / When / Then
      expect(() => validateCostFilters({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        provider: 'Google AI',
      })).toThrow();
    });

    it('should reject endDate before startDate', () => {
      // Given / When / Then
      expect(() => validateCostFilters({
        startDate: '2024-06-01',
        endDate: '2024-01-01',
      })).toThrow(/endDate must be after startDate/);
    });

    it('should reject date range exceeding 12 months', () => {
      // Given / When / Then
      expect(() => validateCostFilters({
        startDate: '2023-01-01',
        endDate: '2024-06-01',
      })).toThrow(/must not exceed 12 months/);
    });

    it('should reject invalid date format', () => {
      // Given / When / Then
      expect(() => validateCostFilters({
        startDate: '01-01-2024',
        endDate: '2024-01-31',
      })).toThrow();
    });

    it('should reject missing required fields', () => {
      // Given / When / Then
      expect(() => validateCostFilters({})).toThrow();
      expect(() => validateCostFilters({ startDate: '2024-01-01' })).toThrow();
    });

    it('should accept valid groupBy values', () => {
      // Given / When / Then
      const base = { startDate: '2024-01-01', endDate: '2024-01-31' };

      expect(validateCostFilters({ ...base, groupBy: 'service' }).groupBy).toBe('service');
      expect(validateCostFilters({ ...base, groupBy: 'team' }).groupBy).toBe('team');
      expect(validateCostFilters({ ...base, groupBy: 'provider' }).groupBy).toBe('provider');
    });

    it('should reject invalid groupBy values', () => {
      // Given / When / Then
      expect(() => validateCostFilters({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'invalid',
      })).toThrow();
    });
  });
});
