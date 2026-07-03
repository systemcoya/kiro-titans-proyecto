const { APIError } = require('../middleware/error-handler');
const taggingService = require('../services/tagging.service');
const taggingRepository = require('../repositories/tagging.repository');

/**
 * Tagging Controller — Task 14.1
 */

/**
 * GET /api/v1/tagging — List all resource tags.
 */
const listTags = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const tags = await taggingRepository.listTags({
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
    });

    res.json({ data: tags, total: tags.length });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/tagging/compliance — Get tagging compliance summary.
 */
const getCompliance = async (req, res, next) => {
  try {
    const resources = await taggingRepository.getComplianceSummary();
    const compliance = taggingService.calculateComplianceRate(resources);

    res.json(compliance);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/tagging/:resourceId — Get tags for a resource.
 */
const getResourceTags = async (req, res, next) => {
  try {
    const tags = await taggingRepository.getByResourceId(req.params.resourceId);
    if (!tags) {
      throw new APIError(404, 'Not Found', 'Recurso no encontrado');
    }
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/tagging/:resourceId — Create or update tags for a resource.
 * Requires role: manager or admin.
 */
const upsertTags = async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      throw new APIError(403, 'Forbidden', 'No tiene permisos para modificar etiquetas');
    }

    const { team, project, environment, aiUseCase } = req.body;
    taggingService.validateTagUpdate({ team, project, environment, aiUseCase });

    const result = await taggingRepository.upsertTags({
      resourceId: req.params.resourceId,
      team, project, environment, aiUseCase,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { listTags, getCompliance, getResourceTags, upsertTags };
