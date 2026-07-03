'use strict';

const { Router } = require('express');
const { APIError } = require('../middleware/error-handler');
const taggingService = require('../services/tagging.service');
const { validateResourceTag } = require('../validators/tagging.validator');

const router = Router();

/**
 * GET /api/v1/tagging/resources
 * Returns all resource tags.
 */
router.get('/resources', async (req, res, next) => {
  try {
    const tags = await taggingService.getAllTags();
    return res.json(tags);
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/tagging/resources
 * Creates a new resource tag.
 */
router.post('/resources', async (req, res, next) => {
  try {
    const data = validateResourceTag(req.body);
    const tag = await taggingService.createTag(data);
    return res.status(201).json(tag);
  } catch (error) {
    if (error.name === 'ZodError') {
      const details = error.errors.map((e) => ({ field: e.path.join('.'), reason: e.message }));
      return next(new APIError(400, 'Bad Request', 'Datos de etiqueta inválidos', details));
    }
    return next(error);
  }
});

/**
 * PUT /api/v1/tagging/resources/:id
 * Updates an existing resource tag.
 */
router.put('/resources/:id', async (req, res, next) => {
  try {
    const data = validateResourceTag(req.body);
    const tag = await taggingService.updateTag(req.params.id, data);
    if (!tag) {
      throw new APIError(404, 'Not Found', 'Etiqueta no encontrada');
    }
    return res.json(tag);
  } catch (error) {
    if (error.name === 'ZodError') {
      const details = error.errors.map((e) => ({ field: e.path.join('.'), reason: e.message }));
      return next(new APIError(400, 'Bad Request', 'Datos de etiqueta inválidos', details));
    }
    return next(error);
  }
});

/**
 * DELETE /api/v1/tagging/resources/:id
 * Deletes a resource tag.
 */
router.delete('/resources/:id', async (req, res, next) => {
  try {
    const deleted = await taggingService.deleteTag(req.params.id);
    if (!deleted) {
      throw new APIError(404, 'Not Found', 'Etiqueta no encontrada');
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/tagging/compliance
 * Returns tagging compliance percentage.
 */
router.get('/compliance', async (req, res, next) => {
  try {
    const compliance = await taggingService.getCompliance();
    return res.json(compliance);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
