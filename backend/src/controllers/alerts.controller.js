const { APIError } = require('../middleware/error-handler');
const { createAlertSchema, updateAlertSchema, alertIdParamSchema, alertHistoryQuerySchema } = require('../validators/alerts.validator');
const alertsService = require('../services/alerts.service');
const alertsRepository = require('../repositories/alerts.repository');

/**
 * Alerts Controller — HUF04.
 * Handles HTTP requests, validates input, delegates to service.
 */

/**
 * GET /api/v1/alerts — List active alert rules.
 */
const listAlerts = async (req, res, next) => {
  try {
    const alerts = await alertsRepository.listAlerts();

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
    const existing = await alertsRepository.findByService(serviceId);
    if (existing) {
      throw new APIError(409, 'Conflict', `Ya existe una regla de alerta activa para el servicio ${serviceId}`);
    }

    // Create alert
    const newAlert = await alertsRepository.createAlert({ service: serviceId, threshold: thresholdCop, recipient: recipientEmail, userId: req.user.id });

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

    const updatedAlert = await alertsRepository.updateAlert(paramsParsed.data.id, {
      threshold: bodyParsed.data.thresholdCop,
      recipient: bodyParsed.data.recipientEmail,
    });

    if (!updatedAlert) {
      throw new APIError(404, 'Not Found', 'Alerta no encontrada');
    }

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

    const deleted = await alertsRepository.deleteAlert(paramsParsed.data.id);
    if (!deleted) {
      throw new APIError(404, 'Not Found', 'Alerta no encontrada');
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

    const history = await alertsRepository.getAlertHistory(parsed.data);

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

    const activeAlerts = await alertsRepository.listAlerts();

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
