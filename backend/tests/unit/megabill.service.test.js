'use strict';

const { getMegaBill, getDrillDown, calculatePercentages, roundTo } = require('../../src/services/megabill.service');
const megabillRepository = require('../../src/repositories/megabill.repository');

jest.mock('../../src/repositories/megabill.repository');

describe('megabill.service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMegaBill', () => {
    it('should return totals by category with percentage distribution', async () => {
      // Given
      megabillRepository.getTotalsByCategory.mockResolvedValue([
        { category: 'cloud', total: '28500.00', service_count: '7' },
        { category: 'saas', total: '9800.50', service_count: '2' },
        { category: 'licenses', total: '6930.00', service_count: '2' },
      ]);

      // When
      const result = await getMegaBill();

      // Then
      expect(result.totalCost).toBe(45230.50);
      expect(result.categories).toHaveLength(3);
      expect(result.categories[0]).toEqual({
        category: 'cloud',
        totalCost: 28500.00,
        percentage: expect.any(Number),
      });
      expect(result.categories[1]).toEqual({
        category: 'saas',
        totalCost: 9800.50,
        percentage: expect.any(Number),
      });
      expect(result.categories[2]).toEqual({
        category: 'licenses',
        totalCost: 6930.00,
        percentage: expect.any(Number),
      });

      // Percentages should sum to 100
      const totalPercentage = result.categories.reduce((sum, c) => sum + c.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it('should return empty state when no data exists', async () => {
      // Given
      megabillRepository.getTotalsByCategory.mockResolvedValue([]);

      // When
      const result = await getMegaBill();

      // Then
      expect(result).toEqual({ totalCost: 0, categories: [] });
    });

    it('should handle partial data (some categories missing)', async () => {
      // Given
      megabillRepository.getTotalsByCategory.mockResolvedValue([
        { category: 'cloud', total: '15000.00', service_count: '3' },
      ]);

      // When
      const result = await getMegaBill();

      // Then
      expect(result.totalCost).toBe(15000.00);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].percentage).toBe(100);
    });

    it('should handle null result from repository', async () => {
      // Given
      megabillRepository.getTotalsByCategory.mockResolvedValue(null);

      // When
      const result = await getMegaBill();

      // Then
      expect(result).toEqual({ totalCost: 0, categories: [] });
    });

    it('should round costs to 2 decimals and percentages to 1 decimal', async () => {
      // Given
      megabillRepository.getTotalsByCategory.mockResolvedValue([
        { category: 'cloud', total: '33333.33', service_count: '3' },
        { category: 'saas', total: '33333.33', service_count: '2' },
        { category: 'licenses', total: '33333.34', service_count: '2' },
      ]);

      // When
      const result = await getMegaBill();

      // Then
      expect(result.totalCost).toBe(100000.00);
      result.categories.forEach((cat) => {
        const decimalPlaces = cat.percentage.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
      });
      const totalPercentage = result.categories.reduce((sum, c) => sum + c.percentage, 0);
      expect(totalPercentage).toBe(100);
    });
  });

  describe('getDrillDown', () => {
    it('should return service details for a valid category', async () => {
      // Given
      megabillRepository.getServicesByCategory.mockResolvedValue([
        { service_name: 'EC2 Instances', billed_cost: '12500.00', usage_quantity: '48', provider: 'AWS', category: 'cloud' },
        { service_name: 'S3 Storage', billed_cost: '3500.50', usage_quantity: '2500', provider: 'AWS', category: 'cloud' },
      ]);

      // When
      const result = await getDrillDown('cloud');

      // Then
      expect(result.category).toBe('cloud');
      expect(result.totalCost).toBe(16000.50);
      expect(result.services).toHaveLength(2);
      expect(result.services[0]).toEqual({
        serviceName: 'EC2 Instances',
        billedCost: 12500.00,
        usageQuantity: 48,
        provider: 'AWS',
      });
      expect(result.services[1]).toEqual({
        serviceName: 'S3 Storage',
        billedCost: 3500.50,
        usageQuantity: 2500,
        provider: 'AWS',
      });
    });

    it('should return empty services array when category has no data', async () => {
      // Given
      megabillRepository.getServicesByCategory.mockResolvedValue([]);

      // When
      const result = await getDrillDown('licenses');

      // Then
      expect(result).toEqual({ category: 'licenses', totalCost: 0, services: [] });
    });

    it('should return empty services array when repository returns null', async () => {
      // Given
      megabillRepository.getServicesByCategory.mockResolvedValue(null);

      // When
      const result = await getDrillDown('saas');

      // Then
      expect(result).toEqual({ category: 'saas', totalCost: 0, services: [] });
    });

    it('should normalize data to FOCUS format (camelCase keys)', async () => {
      // Given
      megabillRepository.getServicesByCategory.mockResolvedValue([
        { service_name: 'Datadog', billed_cost: '1650.00', usage_quantity: '100', provider: 'Datadog', category: 'saas' },
      ]);

      // When
      const result = await getDrillDown('saas');

      // Then
      const service = result.services[0];
      expect(service).toHaveProperty('serviceName');
      expect(service).toHaveProperty('billedCost');
      expect(service).toHaveProperty('usageQuantity');
      expect(service).toHaveProperty('provider');
      expect(service).not.toHaveProperty('service_name');
      expect(service).not.toHaveProperty('billed_cost');
      expect(service).not.toHaveProperty('usage_quantity');
    });

    it('should pass the category to the repository', async () => {
      // Given
      megabillRepository.getServicesByCategory.mockResolvedValue([]);

      // When
      await getDrillDown('cloud');

      // Then
      expect(megabillRepository.getServicesByCategory).toHaveBeenCalledWith('cloud');
    });
  });

  describe('calculatePercentages', () => {
    it('should return 0% for all categories when totalCost is 0', () => {
      const categories = [
        { category: 'cloud', totalCost: 0 },
        { category: 'saas', totalCost: 0 },
      ];
      const result = calculatePercentages(categories, 0);
      expect(result.every((c) => c.percentage === 0)).toBe(true);
    });

    it('should adjust percentages to sum to exactly 100%', () => {
      const categories = [
        { category: 'cloud', totalCost: 33.33 },
        { category: 'saas', totalCost: 33.33 },
        { category: 'licenses', totalCost: 33.34 },
      ];
      const result = calculatePercentages(categories, 100);
      const total = result.reduce((sum, c) => sum + c.percentage, 0);
      expect(roundTo(total, 1)).toBe(100);
    });

    it('should handle a single category', () => {
      const categories = [{ category: 'cloud', totalCost: 5000 }];
      const result = calculatePercentages(categories, 5000);
      expect(result[0].percentage).toBe(100);
    });
  });

  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 1)).toBe(3.1);
      expect(roundTo(2.555, 2)).toBe(2.56);
    });

    it('should handle 0 decimals', () => {
      expect(roundTo(3.7, 0)).toBe(4);
    });
  });
});
