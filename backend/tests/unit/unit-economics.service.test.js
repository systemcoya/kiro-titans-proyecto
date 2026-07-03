'use strict';

const {
  calculateUnitCost,
  determineTrendDirection,
  resolveDateRange,
  buildWeeklyTrend,
  getUnitEconomics,
} = require('../../src/services/unit-economics.service');

// Mock the repository
jest.mock('../../src/repositories/unit-economics.repository');
const unitEconomicsRepository = require('../../src/repositories/unit-economics.repository');

describe('unit-economics.service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('calculateUnitCost', () => {
    it('should return totalCost / transactions rounded to 4 decimals', () => {
      // Given
      const totalCost = 100.00;
      const transactions = 800;

      // When
      const result = calculateUnitCost(totalCost, transactions);

      // Then
      expect(result).toBe(0.125);
    });

    it('should return null when transactions is 0', () => {
      // Given
      const totalCost = 500.00;
      const transactions = 0;

      // When
      const result = calculateUnitCost(totalCost, transactions);

      // Then
      expect(result).toBeNull();
    });

    it('should handle very small unit costs correctly', () => {
      // Given
      const totalCost = 0.01;
      const transactions = 10000;

      // When
      const result = calculateUnitCost(totalCost, transactions);

      // Then
      expect(result).toBe(0);
    });

    it('should handle large costs and few transactions', () => {
      // Given
      const totalCost = 9999.99;
      const transactions = 3;

      // When
      const result = calculateUnitCost(totalCost, transactions);

      // Then
      expect(result).toBe(3333.33);
    });
  });

  describe('determineTrendDirection', () => {
    it('should return "up" when current > previous', () => {
      expect(determineTrendDirection(1.5, 1.2)).toBe('up');
    });

    it('should return "down" when current < previous', () => {
      expect(determineTrendDirection(0.8, 1.2)).toBe('down');
    });

    it('should return "stable" when current === previous', () => {
      expect(determineTrendDirection(1.5, 1.5)).toBe('stable');
    });

    it('should return null when current unit cost is null (0 transactions)', () => {
      expect(determineTrendDirection(null, 1.5)).toBeNull();
    });

    it('should return "stable" when previous unit cost is null but current is valid', () => {
      expect(determineTrendDirection(1.2, null)).toBe('stable');
    });
  });

  describe('resolveDateRange', () => {
    it('should return custom dates when startDate and endDate are provided', () => {
      // Given
      const params = { startDate: '2024-06-01', endDate: '2024-06-30' };

      // When
      const result = resolveDateRange(params);

      // Then
      expect(result).toEqual({ startDate: '2024-06-01', endDate: '2024-06-30' });
    });

    it('should return current week range for period=week', () => {
      // Given
      const params = { period: 'week' };

      // When
      const result = resolveDateRange(params);

      // Then
      expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const start = new Date(result.startDate);
      const end = new Date(result.endDate);
      expect(end >= start).toBe(true);
      // Range should be <= 7 days
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeLessThanOrEqual(7);
    });

    it('should return current month range for period=month', () => {
      // Given
      const params = { period: 'month' };

      // When
      const result = resolveDateRange(params);

      // Then
      // startDate should be the first day of the current month (YYYY-MM-01)
      expect(result.startDate).toMatch(/^\d{4}-\d{2}-01$/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('buildWeeklyTrend', () => {
    it('should calculate unit costs for each weekly row', () => {
      // Given
      const weeklyRows = [
        { weekly_cost: '100.00', weekly_transactions: '50' },
        { weekly_cost: '120.00', weekly_transactions: '60' },
        { weekly_cost: '90.00', weekly_transactions: '45' },
      ];

      // When
      const result = buildWeeklyTrend(weeklyRows);

      // Then
      expect(result).toEqual([2.0, 2.0, 2.0]);
    });

    it('should return null in the trend for weeks with 0 transactions', () => {
      // Given
      const weeklyRows = [
        { weekly_cost: '100.00', weekly_transactions: '50' },
        { weekly_cost: '0.00', weekly_transactions: '0' },
        { weekly_cost: '80.00', weekly_transactions: '40' },
      ];

      // When
      const result = buildWeeklyTrend(weeklyRows);

      // Then
      expect(result).toEqual([2.0, null, 2.0]);
    });

    it('should return empty array when no weekly data exists', () => {
      // Given / When
      const result = buildWeeklyTrend([]);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('getUnitEconomics', () => {
    it('should return formatted unit economics data with trends', async () => {
      // Given
      unitEconomicsRepository.getUnitEconomicsByPeriod.mockResolvedValue({
        rows: [
          {
            service_name: 'Bedrock Claude',
            use_case: 'Cotización de póliza',
            total_cost_usd: '500.00',
            transactions_processed: '2500',
          },
        ],
      });

      unitEconomicsRepository.getWeeklyTrend.mockResolvedValue({
        rows: [
          { service_name: 'Bedrock Claude', use_case: 'Cotización de póliza', week_start: '2024-05-06', weekly_cost: '60.00', weekly_transactions: '300' },
          { service_name: 'Bedrock Claude', use_case: 'Cotización de póliza', week_start: '2024-05-13', weekly_cost: '65.00', weekly_transactions: '325' },
        ],
      });

      // When
      const result = await getUnitEconomics({ period: 'month' });

      // Then
      expect(result.data).toHaveLength(1);
      expect(result.data[0].serviceName).toBe('Bedrock Claude');
      expect(result.data[0].useCase).toBe('Cotización de póliza');
      expect(result.data[0].totalCostUsd).toBe(500.00);
      expect(result.data[0].transactionsProcessed).toBe(2500);
      expect(result.data[0].unitCostUsd).toBe(0.2);
      expect(result.data[0].weeklyTrend).toEqual([0.2, 0.2]);
      expect(result.data[0].trendDirection).toBe('stable');
      expect(result.period).toHaveProperty('startDate');
      expect(result.period).toHaveProperty('endDate');
    });

    it('should return null unitCostUsd and null trendDirection when transactions = 0', async () => {
      // Given
      unitEconomicsRepository.getUnitEconomicsByPeriod.mockResolvedValue({
        rows: [
          {
            service_name: 'GPT-4',
            use_case: 'Atención al cliente',
            total_cost_usd: '0.00',
            transactions_processed: '0',
          },
        ],
      });

      unitEconomicsRepository.getWeeklyTrend.mockResolvedValue({
        rows: [
          { service_name: 'GPT-4', use_case: 'Atención al cliente', week_start: '2024-05-06', weekly_cost: '0.00', weekly_transactions: '0' },
        ],
      });

      // When
      const result = await getUnitEconomics({ period: 'week' });

      // Then
      expect(result.data[0].unitCostUsd).toBeNull();
      expect(result.data[0].trendDirection).toBeNull();
    });

    it('should return empty data array when no records exist for period', async () => {
      // Given
      unitEconomicsRepository.getUnitEconomicsByPeriod.mockResolvedValue({ rows: [] });
      unitEconomicsRepository.getWeeklyTrend.mockResolvedValue({ rows: [] });

      // When
      const result = await getUnitEconomics({ startDate: '2024-01-01', endDate: '2024-01-07' });

      // Then
      expect(result.data).toEqual([]);
      expect(result.period).toEqual({ startDate: '2024-01-01', endDate: '2024-01-07' });
    });

    it('should detect "up" trend direction when cost increases', async () => {
      // Given
      unitEconomicsRepository.getUnitEconomicsByPeriod.mockResolvedValue({
        rows: [
          {
            service_name: 'Claude Haiku',
            use_case: 'Análisis de siniestro',
            total_cost_usd: '300.00',
            transactions_processed: '1000',
          },
        ],
      });

      unitEconomicsRepository.getWeeklyTrend.mockResolvedValue({
        rows: [
          { service_name: 'Claude Haiku', use_case: 'Análisis de siniestro', week_start: '2024-05-06', weekly_cost: '50.00', weekly_transactions: '500' },
          { service_name: 'Claude Haiku', use_case: 'Análisis de siniestro', week_start: '2024-05-13', weekly_cost: '80.00', weekly_transactions: '500' },
        ],
      });

      // When
      const result = await getUnitEconomics({ period: 'month' });

      // Then
      expect(result.data[0].trendDirection).toBe('up');
      expect(result.data[0].weeklyTrend).toEqual([0.1, 0.16]);
    });

    it('should detect "down" trend direction when cost decreases', async () => {
      // Given
      unitEconomicsRepository.getUnitEconomicsByPeriod.mockResolvedValue({
        rows: [
          {
            service_name: 'Claude Haiku',
            use_case: 'Análisis de siniestro',
            total_cost_usd: '300.00',
            transactions_processed: '1000',
          },
        ],
      });

      unitEconomicsRepository.getWeeklyTrend.mockResolvedValue({
        rows: [
          { service_name: 'Claude Haiku', use_case: 'Análisis de siniestro', week_start: '2024-05-06', weekly_cost: '80.00', weekly_transactions: '500' },
          { service_name: 'Claude Haiku', use_case: 'Análisis de siniestro', week_start: '2024-05-13', weekly_cost: '50.00', weekly_transactions: '500' },
        ],
      });

      // When
      const result = await getUnitEconomics({ period: 'month' });

      // Then
      expect(result.data[0].trendDirection).toBe('down');
    });
  });
});
