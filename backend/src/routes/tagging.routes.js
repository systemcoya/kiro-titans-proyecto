const express = require('express');
const taggingController = require('../controllers/tagging.controller');

const router = express.Router();

/**
 * Tagging Routes — Task 14.1
 */
router.get('/', taggingController.listTags);
router.get('/compliance', taggingController.getCompliance);
router.get('/:resourceId', taggingController.getResourceTags);
router.put('/:resourceId', taggingController.upsertTags);

module.exports = router;
