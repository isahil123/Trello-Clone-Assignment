const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Fetch all users
router.get('/', userController.getUsers.bind(userController));

module.exports = router;
