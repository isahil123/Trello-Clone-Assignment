const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklist.controller');

// --- Checklist Items ---
// IMPORTANT: These item routes MUST come BEFORE the checklist /:checklistId
// routes. Otherwise, Express will interpret the string "items" as a dynamic :checklistId!

router.post('/items', checklistController.createItem);
router.patch('/items/reorder', checklistController.reorderItems);
router.patch('/items/:itemId', checklistController.updateItem);
router.delete('/items/:itemId', checklistController.deleteItem);


// --- Checklists ---

// POST /api/checklists -> create a new checklist
router.post('/', checklistController.createChecklist);

// PATCH /api/checklists/:checklistId -> update checklist title
router.patch('/:checklistId', checklistController.updateChecklist);

// DELETE /api/checklists/:checklistId -> delete checklist
router.delete('/:checklistId', checklistController.deleteChecklist);


module.exports = router;
