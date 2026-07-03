const { APIError } = require('../middleware/error-handler');
const { simulatorProjectSchema } = require('../validators/simulator.validator');
const simulatorService = require('../services/simulator.service');
const simulatorRepository = require('../repositories/simulator.repository');

/**
 * Simulator Controller — HUF06.
 * Handles HTTP requests for What-If Cost Projections.
 */

const DEFAULT_EXCHANGE_RATE = parseFloat(process.env.EXCHANGE_RATE_USD_COP) || 4200;

/**
 * POST /api/v1/simulator/project — Calculate cost projection.
 */
const project = async (req, res, next) => {
  try {
    // Validate input
    const parsed = simulatorProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        reason: e.message,
      }));
      throw new APIError(400, 'Bad Request', 'Error de validación en la proyección', details);
    }

    const { serviceIncrements } = parsed.data;

    // Get current costs from DB using service names (serviceId maps to service_name in our schema)
    const serviceNames = serviceIncrements.map((s) => s.serviceId);
    const currentCosts = await simulatorRepository.getCurrentMonthlyCosts(serviceNames);

    const serviceData = serviceIncrements.map((increment) => {
      const current = currentCosts.find((c) => c.serviceName === increment.serviceId);
      return {
        serviceId: increment.serviceId,
        currentMonthlyCostCop: current ? current.monthlyCostCop : 45000000,
        percentIncrement: increment.percentIncrement,
      };
    });

    const projection = simulatorService.generateProjection(serviceData, DEFAULT_EXCHANGE_RATE);

    res.json(projection);
  } catch (err) {
    next(err);
  }
};

module.exports = { project };
