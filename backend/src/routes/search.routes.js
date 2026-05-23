const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// GET /api/search?q=...
router.get('/', searchController.globalSearch);

module.exports = router;
