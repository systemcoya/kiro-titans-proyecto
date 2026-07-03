const { APIError } = require('../middleware/error-handler');
const { createAlertSchema, updateAlertSchema, alertIdParamSchema, alertHistoryQuerySchema } = require('../validators/alerts.validator');
const alertsService = require('../services/alerts.service');

/**
 * Alerts Controller — HUF04.
 * Handles HTTP requests, validates input, delegates to service.
 * Repository calls are stubbed until Task 1.3 (schema) is complete.
 */

/**
 * GET /api/v1/alerts — List active alert rules.
 */
const listAlerts = async (req, res, next) => {
  try {
    // TODO: Replace with alertsRepository.listAlerts() when DB is ready
    const alerts = req.app.locals.alertsRepository
      ? await req.app.locals.alertsRepository.listAlerts()
      : [];

    res.json({ data: alerts, total: alerts.length });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/alerts — Create alert rule.
 * Requires role: manager or admin.
 */
const createAlert = async (req, res, next) => {
  try {
    // RBAC check
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para crear alertas');
    }

    // Validate input
    const parsed = createAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        reason: e.message,
      }));
      throw new APIError(400, 'Bad Request', 'Error de validación', details);
    }

    const { serviceId, thresholdCop, recipientEmail } = parsed.data;

    // Check uniqueness
    const existingAlerts = req.app.locals.alertsRepository
      ? await req.app.locals.alertsRepository.listAlerts()
      : [];
    alertsService.validateUniqueServiceAlert(serviceId, existingAlerts);

    // Create alert
    const newAlert = req.app.locals.alertsRepository
      ? await req.app.locals.alertsRepository.createAlert({ serviceId, thresholdCop, recipientEmail, createdBy: req.user.id })
      : { id: 'stub-id', serviceId, thresholdCop, recipientEmail, severity: 'none', currentCostCop: 0, isActive: true, createdAt: new Date().toISOString() };

    res.status(201).json(newAlert);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/alerts/:id — Update alert rule.
 * Requires role: manager or admin.
 */
const updateAlert = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para modificar alertas');
    }

    const paramsParsed = alertIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      throw new APIError(400, 'Bad Request', 'ID de alerta inválido');
    }

    const bodyParsed = updateAlertSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      const details = bodyParsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        reason: e.message,
      }));
      throw new APIError(400, 'Bad Request', 'Error de validación', details);
    }

    const updatedAlert = req.app.locals.alertsRepository
      ? await req.app.locals.alertsRepository.updateAlert(paramsParsed.data.id, bodyParsed.data)
      : { id: paramsParsed.data.id, ...bodyParsed.data, updatedAt: new Date().toISOString() };

    res.json(updatedAlert);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/alerts/:id — Delete alert rule.
 * Requires role: admin only.
 */
const deleteAlert = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new APIError(403, 'Forbidden', 'Solo administradores pueden eliminar alertas');
    }

    const paramsParsed = alertIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      throw new APIError(400, 'Bad Request', 'ID de alerta inválido');
    }

    if (req.app.locals.alertsRepository) {
      await req.app.locals.alertsRepository.deleteAlert(paramsParsed.data.id);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/alerts/history — Get alert trigger history.
 */
const getAlertHistory = async (req, res, next) => {
  try {
    const parsed = alertHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new APIError(400, 'Bad Request', 'Parámetros de consulta inválidos');
    }

    const history = req.app.locals.alertsRepository
      ? await req.app.locals.alertsRepository.getAlertHistory(parsed.data)
      : [];

    res.json({ data: history, total: history.length });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/alerts/evaluate — Evaluate all active alerts.
 */
const evaluateAllAlerts = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para evaluar alertas');
    }

    const activeAlerts = req.app.locals.alertsRepository
      ? await req.app.locals.alertsRepository.listAlerts()
      : [];

    const evaluationResults = alertsService.evaluateAlerts(activeAlerts);

    // Update alerts that changed severity and create history entries
    const triggered = evaluationResults.filter((r) => r.triggered);

    res.json({
      evaluated: evaluationResults.length,
      triggered: triggered.length,
      results: evaluationResults,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertHistory,
  evaluateAllAlerts,
};
