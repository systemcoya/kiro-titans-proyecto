const { APIError } = require('../middleware/error-handler');

/**
 * Alert Service — Business logic for configurable threshold alerts.
 * Implements Requirements 4.4, 4.5, 4.6, 4.8 (HUF04).
 *
 * Dependencies: alertsRepository (injected when DB is ready).
 * For now, pure logic functions are exported independently.
 */

/**
 * Calculate alert severity based on current cost vs threshold.
 * - critical: currentCost >= threshold (100%)
 * - warning: currentCost >= 80% of threshold AND < threshold
 * - none: currentCost < 80% of threshold
 *
 * @param {number} currentCostCop - Current accumulated cost in COP
 * @param {number} thresholdCop - Configured threshold in COP
 * @returns {'none' | 'warning' | 'critical'}
 */
const calculateSeverity = (currentCostCop, thresholdCop) => {
  if (thresholdCop <= 0) {
    return 'none';
  }
  if (currentCostCop >= thresholdCop) {
    return 'critical';
  }
  if (currentCostCop >= thresholdCop * 0.8) {
    return 'warning';
  }
  return 'none';
};

/**
 * Evaluate all active alerts and update their severity.
 * Returns updated alert objects with new severity values.
 *
 * @param {Array<{id: string, serviceId: string, thresholdCop: number, currentCostCop: number, severity: string}>} alerts
 * @returns {Array<{id: string, newSeverity: string, previousSeverity: string, triggered: boolean}>}
 */
const evaluateAlerts = (alerts) => {
  return alerts.map((alert) => {
    const newSeverity = calculateSeverity(alert.currentCostCop, alert.thresholdCop);
    const triggered = newSeverity !== alert.severity && newSeverity !== 'none';

    return {
      id: alert.id,
      newSeverity,
      previousSeverity: alert.severity,
      triggered,
    };
  });
};

/**
 * Validate that no active alert already exists for the given serviceId.
 * Throws ConflictError (409) if duplicate found.
 *
 * @param {string} serviceId
 * @param {Array<{serviceId: string, isActive: boolean}>} existingAlerts
 * @throws {APIError} 409 if duplicate active rule exists
 */
const validateUniqueServiceAlert = (serviceId, existingAlerts) => {
  const duplicate = existingAlerts.find(
    (alert) => alert.serviceId === serviceId && alert.isActive
  );

  if (duplicate) {
    throw new APIError(
      409,
      'Conflict',
      `Ya existe una regla de alerta activa para el servicio ${serviceId}`
    );
  }
};

/**
 * Build alert history entry when severity changes.
 *
 * @param {{id: string, serviceName: string, thresholdCop: number, currentCostCop: number}} alert
 * @param {string} newSeverity
 * @returns {{alertRuleId: string, serviceName: string, thresholdValue: number, actualValue: number, severity: string, triggeredAt: string}}
 */
const buildAlertHistoryEntry = (alert, newSeverity) => {
  return {
    alertRuleId: alert.id,
    serviceName: alert.serviceName,
    thresholdValue: alert.thresholdCop,
    actualValue: alert.currentCostCop,
    severity: newSeverity,
    triggeredAt: new Date().toISOString(),
  };
};

module.exports = {
  calculateSeverity,
  evaluateAlerts,
  validateUniqueServiceAlert,
  buildAlertHistoryEntry,
};
