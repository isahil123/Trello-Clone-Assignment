const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/user.controller');

// Fetch all users
router.get('/', getUsers);

module.exports = router;
