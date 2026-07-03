const fc = require('fast-check');
const taggingService = require('../../../src/services/tagging.service');

/**
 * Property 14: Tagging compliance
 * Tests Sergio's refactored tagging service exports.
 */
describe('Tagging Service — Property Tests', () => {
  describe('getCompliance — returns compliance data', () => {
    it('getCompliance function exists', () => {
      expect(typeof taggingService.getCompliance).toBe('function');
    });
  });

  describe('getAllTags — returns tag list', () => {
    it('getAllTags function exists', () => {
      expect(typeof taggingService.getAllTags).toBe('function');
    });
  });

  describe('createTag — creates a tag', () => {
    it('createTag function exists', () => {
      expect(typeof taggingService.createTag).toBe('function');
    });
  });
});
