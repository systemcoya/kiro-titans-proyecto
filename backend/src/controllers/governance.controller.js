const { APIError } = require('../middleware/error-handler');
const { createPolicySchema, updatePolicySchema, policyIdParamSchema, recommendationFilterSchema } = require('../validators/governance.validator');
const governanceService = require('../services/governance.service');
const governanceRepository = require('../repositories/governance.repository');

/**
 * Governance Controller — HUF07.
 * Handles HTTP requests for governance policies and recommendations.
 */

/**
 * GET /api/v1/governance/policies — List all policies.
 */
const listPolicies = async (req, res, next) => {
  try {
    const policies = await governanceRepository.listPolicies();
    res.json({ data: policies, total: policies.length });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/governance/policies — Create policy.
 * Requires role: manager or admin.
 */
const createPolicy = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para crear políticas de gobernanza');
    }

    const parsed = createPolicySchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        reason: e.message,
      }));
      throw new APIError(400, 'Bad Request', 'Error de validación', details);
    }

    const newPolicy = await governanceRepository.createPolicy({
      resource: parsed.data.name,
      metric: parsed.data.conditions.metric,
      operator: parsed.data.conditions.operator === 'less_than' ? 'lt' : parsed.data.conditions.operator === 'greater_than' ? 'gt' : 'eq',
      value: parsed.data.conditions.value,
      evaluationPeriodDays: parsed.data.conditions.durationDays,
    });

    res.status(201).json(newPolicy);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/governance/policies/:id — Update policy.
 * Requires role: manager or admin.
 */
const updatePolicy = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para modificar políticas');
    }

    const paramsParsed = policyIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      throw new APIError(400, 'Bad Request', 'ID de política inválido');
    }

    const bodyParsed = updatePolicySchema.safeParse(req.body);
    if (!bodyParsed.success) {
      const details = bodyParsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        reason: e.message,
      }));
      throw new APIError(400, 'Bad Request', 'Error de validación', details);
    }

    const updated = await governanceRepository.updatePolicy(paramsParsed.data.id, bodyParsed.data);
    if (!updated) {
      throw new APIError(404, 'Not Found', 'Política no encontrada');
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/governance/policies/:id — Delete policy.
 * Requires role: admin only.
 */
const deletePolicy = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new APIError(403, 'Forbidden', 'Solo administradores pueden eliminar políticas');
    }

    const paramsParsed = policyIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      throw new APIError(400, 'Bad Request', 'ID de política inválido');
    }

    const deleted = await governanceRepository.deletePolicy(paramsParsed.data.id);
    if (!deleted) {
      throw new APIError(404, 'Not Found', 'Política no encontrada');
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/governance/recommendations — List recommendations.
 */
const listRecommendations = async (req, res, next) => {
  try {
    const parsed = recommendationFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new APIError(400, 'Bad Request', 'Parámetros de filtro inválidos');
    }

    const recommendations = await governanceRepository.listRecommendations(parsed.data);
    const totalSavings = governanceService.calculateTotalSavings(
      recommendations.map((r) => ({ ...r, estimatedSavingCop: r.estimatedSavingCop, status: r.status }))
    );

    res.json({ data: recommendations, total: recommendations.length, totalEstimatedSavingsCop: totalSavings });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/governance/recommendations/:id/accept — Accept recommendation.
 * Requires role: manager or admin.
 */
const acceptRecommendation = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para aceptar recomendaciones');
    }

    const paramsParsed = policyIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      throw new APIError(400, 'Bad Request', 'ID de recomendación inválido');
    }

    const current = await governanceRepository.getRecommendation(paramsParsed.data.id);
    if (!current) {
      throw new APIError(404, 'Not Found', 'Recomendación no encontrada');
    }

    governanceService.validateStatusTransition(current.status, 'accepted');

    const updated = await governanceRepository.updateRecommendationStatus(paramsParsed.data.id, 'implemented');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/governance/recommendations/:id/dismiss — Dismiss recommendation.
 * Requires role: manager or admin.
 */
const dismissRecommendation = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para descartar recomendaciones');
    }

    const paramsParsed = policyIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      throw new APIError(400, 'Bad Request', 'ID de recomendación inválido');
    }

    const current = await governanceRepository.getRecommendation(paramsParsed.data.id);
    if (!current) {
      throw new APIError(404, 'Not Found', 'Recomendación no encontrada');
    }

    // Note: DB schema only has 'active' and 'implemented'. Dismiss = soft delete.
    governanceService.validateStatusTransition(current.status, 'dismissed');

    // For the current schema, we set status to 'implemented' with a note
    const updated = await governanceRepository.updateRecommendationStatus(paramsParsed.data.id, 'implemented');
    res.json({ ...updated, dismissed: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  listRecommendations,
  acceptRecommendation,
  dismissRecommendation,
};
