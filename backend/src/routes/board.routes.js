const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');

// GET /api/boards -> list boards
router.get('/', boardController.getAllBoards);

// POST /api/boards -> create a new board
router.post('/', boardController.createBoard);

// GET /api/boards/:boardId -> get one board deeply nested
router.get('/:boardId', boardController.getBoardById);

// PATCH /api/boards/:boardId -> update board properties
router.patch('/:boardId', boardController.updateBoard);

// Mount label routes for a specific board
const labelRoutes = require('./label.routes');
router.use('/:boardId/labels', labelRoutes);

module.exports = router;
