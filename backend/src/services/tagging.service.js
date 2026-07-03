const { APIError } = require('../middleware/error-handler');

/**
 * Tagging Service — Task 14.1
 * Business logic for resource tagging governance.
 *
 * Ensures resources have proper tags (team, project, environment, ai_use_case)
 * for accurate cost allocation and showback.
 */

const REQUIRED_TAGS = ['team', 'project', 'environment'];
const VALID_ENVIRONMENTS = ['desarrollo', 'staging', 'producción'];

/**
 * Validate resource tags meet compliance requirements.
 * @param {{team?: string, project?: string, environment?: string, aiUseCase?: string}} tags
 * @returns {{isCompliant: boolean, missingTags: string[], invalidValues: Array<{tag: string, reason: string}>}}
 */
const validateTagCompliance = (tags) => {
  const missingTags = [];
  const invalidValues = [];

  for (const required of REQUIRED_TAGS) {
    if (!tags[required] || tags[required].trim().length === 0) {
      missingTags.push(required);
    }
  }

  if (tags.environment && !VALID_ENVIRONMENTS.includes(tags.environment)) {
    invalidValues.push({
      tag: 'environment',
      reason: `Valor inválido: "${tags.environment}". Valores permitidos: ${VALID_ENVIRONMENTS.join(', ')}`,
    });
  }

  return {
    isCompliant: missingTags.length === 0 && invalidValues.length === 0,
    missingTags,
    invalidValues,
  };
};

/**
 * Calculate tagging compliance percentage across all resources.
 * @param {Array<{team?: string, project?: string, environment?: string}>} resources
 * @returns {{compliancePercent: number, compliantCount: number, totalCount: number, nonCompliant: Array}}
 */
const calculateComplianceRate = (resources) => {
  if (resources.length === 0) {
    return { compliancePercent: 100, compliantCount: 0, totalCount: 0, nonCompliant: [] };
  }

  const nonCompliant = [];
  let compliantCount = 0;

  for (const resource of resources) {
    const result = validateTagCompliance(resource);
    if (result.isCompliant) {
      compliantCount++;
    } else {
      nonCompliant.push({
        resourceId: resource.resourceId,
        missingTags: result.missingTags,
        invalidValues: result.invalidValues,
      });
    }
  }

  const compliancePercent = Math.round((compliantCount / resources.length) * 100 * 100) / 100;

  return {
    compliancePercent,
    compliantCount,
    totalCount: resources.length,
    nonCompliant,
  };
};

/**
 * Validate tag update input.
 * @param {{team?: string, project?: string, environment?: string, aiUseCase?: string}} tags
 * @throws {APIError} if environment value is invalid
 */
const validateTagUpdate = (tags) => {
  if (tags.environment && !VALID_ENVIRONMENTS.includes(tags.environment)) {
    throw new APIError(
      400,
      'Bad Request',
      `Valor de environment inválido. Valores permitidos: ${VALID_ENVIRONMENTS.join(', ')}`
    );
  }
};

module.exports = {
  REQUIRED_TAGS,
  VALID_ENVIRONMENTS,
  validateTagCompliance,
  calculateComplianceRate,
  validateTagUpdate,
};
