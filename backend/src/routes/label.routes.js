const express = require('express');
const router = express.Router({ mergeParams: true });
const labelController = require('../controllers/label.controller');

// GET /api/boards/:boardId/labels
router.get('/', labelController.getLabels);

// POST /api/boards/:boardId/labels
router.post('/', labelController.createLabel);

module.exports = router;
