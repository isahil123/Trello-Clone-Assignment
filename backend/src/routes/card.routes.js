const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');

// POST /api/cards -> create a new card
router.post('/', cardController.createCard);

// PATCH /api/cards/move -> bulk move/reorder cards across lists
router.patch('/move', cardController.moveCards);

// PATCH /api/cards/:cardId/archive -> archive or unarchive a card
router.patch('/:cardId/archive', cardController.archiveCard);

// PATCH /api/cards/:cardId -> update card title or description
router.patch('/:cardId', cardController.updateCard);

// DELETE /api/cards/:cardId -> delete a card entirely
router.delete('/:cardId', cardController.deleteCard);

// --- Card Details (Labels, Members, Comments) ---

router.post('/:cardId/labels', cardController.addLabel);
router.delete('/:cardId/labels/:labelId', cardController.removeLabel);

router.post('/:cardId/members', cardController.addMember);
router.delete('/:cardId/members/:userId', cardController.removeMember);

router.post('/:cardId/comments', cardController.addComment);
router.get('/:cardId/comments', cardController.getComments);

module.exports = router;
