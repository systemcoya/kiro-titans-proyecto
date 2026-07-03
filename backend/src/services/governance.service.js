const { APIError } = require('../middleware/error-handler');

/**
 * Governance Service — Policies and Recommendations logic.
 * Implements Requirements 6.1–6.8 (HUF07).
 *
 * Pure business logic — no DB dependency.
 */

const VALID_STATUSES = ['active', 'accepted', 'dismissed'];
const VALID_RESOURCE_TYPES = ['compute', 'database', 'storage'];

/**
 * Pre-configured policy templates per Requirement 6.7.
 */
const POLICY_TEMPLATES = [
  {
    name: 'Instancias de cómputo ociosas',
    description: 'Detecta instancias EC2/VM con CPU promedio menor al 10% por 7 días consecutivos',
    conditions: {
      metric: 'cpu_utilization_avg',
      operator: 'less_than',
      value: 10,
      durationDays: 7,
    },
    resourceType: 'compute',
    isTemplate: true,
  },
  {
    name: 'Bases de datos sobredimensionadas',
    description: 'Detecta bases de datos con uso de memoria menor al 20% del aprovisionado por 14 días',
    conditions: {
      metric: 'memory_utilization_avg',
      operator: 'less_than',
      value: 20,
      durationDays: 14,
    },
    resourceType: 'database',
    isTemplate: true,
  },
  {
    name: 'Volúmenes de almacenamiento sin uso',
    description: 'Detecta volúmenes EBS/discos sin operaciones I/O por 30 días',
    conditions: {
      metric: 'io_operations',
      operator: 'equals',
      value: 0,
      durationDays: 30,
    },
    resourceType: 'storage',
    isTemplate: true,
  },
];

/**
 * Validate recommendation status transition.
 * Only valid transitions: active → accepted, active → dismissed.
 *
 * @param {string} currentStatus
 * @param {string} newStatus
 * @throws {APIError} if transition is invalid
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus !== 'active') {
    throw new APIError(
      400,
      'Bad Request',
      `No se puede cambiar el estado de una recomendación que ya está ${currentStatus}`
    );
  }

  if (newStatus !== 'accepted' && newStatus !== 'dismissed') {
    throw new APIError(
      400,
      'Bad Request',
      `Estado destino inválido: ${newStatus}. Solo se permite 'accepted' o 'dismissed'`
    );
  }
};

/**
 * Calculate total estimated savings from active recommendations.
 *
 * @param {Array<{estimatedSavingCop: number, status: string}>} recommendations
 * @returns {number} Total savings from active recommendations only
 */
const calculateTotalSavings = (recommendations) => {
  return recommendations
    .filter((rec) => rec.status === 'active')
    .reduce((sum, rec) => sum + rec.estimatedSavingCop, 0);
};

/**
 * Calculate realized savings from accepted recommendations.
 *
 * @param {Array<{estimatedSavingCop: number, status: string}>} recommendations
 * @returns {number} Total realized savings from accepted recommendations
 */
const calculateRealizedSavings = (recommendations) => {
  return recommendations
    .filter((rec) => rec.status === 'accepted')
    .reduce((sum, rec) => sum + rec.estimatedSavingCop, 0);
};

/**
 * Evaluate a governance policy against mock resource data.
 * Returns list of resources that violate the policy.
 *
 * @param {{conditions: object, resourceType: string}} policy
 * @param {Array<{id: string, resourceType: string, metrics: object}>} resources
 * @returns {Array<{resourceId: string, currentConfig: string, recommendedConfig: string, estimatedSavingCop: number}>}
 */
const evaluatePolicy = (policy, resources) => {
  const { conditions, resourceType } = policy;
  const matching = resources.filter((resource) => {
    if (resource.resourceType !== resourceType) return false;

    const metricValue = resource.metrics[conditions.metric];
    if (metricValue === undefined) return false;

    switch (conditions.operator) {
      case 'less_than':
        return metricValue < conditions.value;
      case 'greater_than':
        return metricValue > conditions.value;
      case 'equals':
        return metricValue === conditions.value;
      default:
        return false;
    }
  });

  return matching.map((resource) => ({
    resourceId: resource.id,
    currentConfig: resource.currentConfig || 'N/A',
    recommendedConfig: resource.recommendedConfig || 'Reducir capacidad',
    estimatedSavingCop: resource.estimatedSavingCop || 0,
  }));
};

module.exports = {
  POLICY_TEMPLATES,
  VALID_STATUSES,
  VALID_RESOURCE_TYPES,
  validateStatusTransition,
  calculateTotalSavings,
  calculateRealizedSavings,
  evaluatePolicy,
};
