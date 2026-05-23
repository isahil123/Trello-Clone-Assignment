const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');

// POST /api/lists -> create a new list
router.post('/', listController.createList);

// PATCH /api/lists/reorder -> reorder lists on a board
router.patch('/reorder', listController.reorderLists);

// PATCH /api/lists/:listId -> update list title
router.patch('/:listId', listController.updateList);

// POST /api/lists/:listId/copy -> copy a list
router.post('/:listId/copy', listController.copyList);

// DELETE /api/lists/:listId -> delete a list
router.delete('/:listId', listController.deleteList);
// POST /api/lists/:listId/normalize -> reset card positions
router.post('/:listId/normalize', listController.normalizePositions);

module.exports = router;
