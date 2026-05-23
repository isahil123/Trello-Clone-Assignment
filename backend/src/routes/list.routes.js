const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');

// POST /api/lists -> create a new list
router.post('/', listController.createList);

// PATCH /api/lists/reorder -> reorder lists on a board
router.patch('/reorder', listController.reorderLists);

// PATCH /api/lists/:listId -> update list title
router.patch('/:listId', listController.updateList);

// DELETE /api/lists/:listId -> delete a list
router.delete('/:listId', listController.deleteList);

module.exports = router;
