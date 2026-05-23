const cardService = require('../services/card.service');
const prisma = require('../config/prisma');

async function logActivity(cardId, text) {
  try {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: { include: { members: true } } } } }
    });
    if (!card || !card.list?.board?.members?.length) return;
    const userId = card.list.board.members[0].userId;
    await cardService.addComment(cardId, userId, text, true);
  } catch (err) {
    console.error('Failed to log activity', err);
  }
}

class CardController {
  async createCard(req, res) {
    try {
      const { title, listId, position } = req.body;

      if (!title || !listId || typeof position !== 'number') {
        return res.status(400).json({ success: false, error: 'title, listId, and position are required' });
      }

      const card = await cardService.createCard({ title, listId, position });
      await logActivity(card.id, `Created this card`);
      res.status(201).json({ success: true, data: card });
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({ success: false, error: 'Failed to create card' });
    }
  }

  async updateCard(req, res) {
    try {
      const { cardId } = req.params;
      const { title, description, dueDate, isTemplate, isCompleted, coverColor, coverImage } = req.body;

      // Ensure at least one valid field is provided for the update
      if (title === undefined && description === undefined && dueDate === undefined && isTemplate === undefined && isCompleted === undefined && coverColor === undefined && coverImage === undefined) {
        return res.status(400).json({ success: false, error: 'At least one field is required for update' });
      }

      const existingCard = await cardService.getCardById(cardId);
      if (!existingCard) {
        return res.status(404).json({ success: false, error: 'Card not found' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
      if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
      if (coverColor !== undefined) updateData.coverColor = coverColor;
      if (coverImage !== undefined) updateData.coverImage = coverImage;

      const card = await cardService.updateCard(cardId, updateData);
      
      if (title !== undefined && existingCard.title !== title) await logActivity(cardId, `Changed title to "${title}"`);
      if (dueDate !== undefined) await logActivity(cardId, `Changed due date`);
      if (isCompleted !== undefined) await logActivity(cardId, isCompleted ? `Marked due date complete` : `Marked due date incomplete`);
      if (coverColor !== undefined && existingCard.coverColor !== coverColor) await logActivity(cardId, `Changed cover color`);
      
      res.status(200).json({ success: true, data: card });
    } catch (error) {
      console.error('Error updating card:', error);
      res.status(500).json({ success: false, error: 'Failed to update card' });
    }
  }

  async archiveCard(req, res) {
    try {
      const { cardId } = req.params;
      const { isArchived } = req.body;

      if (typeof isArchived !== 'boolean') {
        return res.status(400).json({ success: false, error: 'isArchived boolean is required' });
      }

      const existingCard = await cardService.getCardById(cardId);
      if (!existingCard) {
        return res.status(404).json({ success: false, error: 'Card not found' });
      }

      const card = await cardService.updateCard(cardId, { isArchived });
      await logActivity(cardId, isArchived ? `Archived this card` : `Unarchived this card`);
      res.status(200).json({ success: true, data: card });
    } catch (error) {
      console.error('Error archiving card:', error);
      res.status(500).json({ success: false, error: 'Failed to archive card' });
    }
  }

  async copyFromTemplate(req, res) {
    try {
      const { cardId } = req.params;
      const { listId, position } = req.body;

      if (!listId || typeof position !== 'number') {
        return res.status(400).json({ success: false, error: 'listId and position are required' });
      }

      const newCard = await cardService.createCardFromTemplate(cardId, listId, position);
      res.status(201).json({ success: true, data: newCard });
    } catch (error) {
      console.error('Error copying card from template:', error);
      res.status(500).json({ success: false, error: 'Failed to create card from template' });
    }
  }

  async moveCards(req, res) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'An array of items with id, listId, and position is required' });
      }

      const result = await cardService.moveCards(items);
      for (const item of items) {
        await logActivity(item.id, `Moved this card`);
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error moving cards:', error);
      res.status(500).json({ success: false, error: 'Failed to move cards' });
    }
  }

  async deleteCard(req, res) {
    try {
      const { cardId } = req.params;
      await cardService.deleteCard(cardId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to delete card' });
    }
  }

  // --- Card Details (Labels, Members, Comments) ---

  async addLabel(req, res) {
    try {
      const { cardId } = req.params;
      const { labelId } = req.body;
      const cardLabel = await cardService.addLabelToCard(cardId, labelId);
      await logActivity(cardId, `Added a label`);
      res.status(201).json({ success: true, data: cardLabel });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to add label' });
    }
  }

  async removeLabel(req, res) {
    try {
      const { cardId, labelId } = req.params;
      await cardService.removeLabelFromCard(cardId, labelId);
      await logActivity(cardId, `Removed a label`);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to remove label' });
    }
  }

  async addMember(req, res) {
    try {
      const { cardId } = req.params;
      const { userId } = req.body;
      const cardMember = await cardService.addMemberToCard(cardId, userId);
      await logActivity(cardId, `Added a member to this card`);
      res.status(201).json({ success: true, data: cardMember });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to add member' });
    }
  }

  async removeMember(req, res) {
    try {
      const { cardId, userId } = req.params;
      await cardService.removeMemberFromCard(cardId, userId);
      await logActivity(cardId, `Removed a member from this card`);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to remove member' });
    }
  }

  async addComment(req, res) {
    try {
      const { cardId } = req.params;
      const { text, userId, isActivity } = req.body; // In a real app, userId comes from req.user
      const comment = await cardService.addComment(cardId, userId, text, isActivity);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to add comment' });
    }
  }

  async getComments(req, res) {
    try {
      const { cardId } = req.params;
      const comments = await cardService.getCommentsByCard(cardId);
      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to fetch comments' });
    }
  }

  // --- Checklists ---

  async addChecklist(req, res) {
    try {
      const { cardId } = req.params;
      const { title } = req.body;
      const checklist = await cardService.addChecklist(cardId, title || 'Checklist');
      await logActivity(cardId, `Added a checklist`);
      res.status(201).json({ success: true, data: checklist });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to add checklist' });
    }
  }

  async deleteChecklist(req, res) {
    try {
      const { cardId, checklistId } = req.params;
      await cardService.deleteChecklist(checklistId);
      await logActivity(cardId, `Removed a checklist`);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to delete checklist' });
    }
  }

  async addChecklistItem(req, res) {
    try {
      const { cardId, checklistId } = req.params;
      const { title, position } = req.body;
      const item = await cardService.addChecklistItem(checklistId, title, position || 1024);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to add item' });
    }
  }

  async updateChecklistItem(req, res) {
    try {
      const { cardId, itemId } = req.params;
      const { title, isCompleted } = req.body;
      const data = {};
      if (title !== undefined) data.title = title;
      if (isCompleted !== undefined) data.isCompleted = isCompleted;
      
      const item = await cardService.updateChecklistItem(itemId, data);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to update item' });
    }
  }

  async deleteChecklistItem(req, res) {
    try {
      const { cardId, itemId } = req.params;
      await cardService.deleteChecklistItem(itemId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to delete item' });
    }
  }
}

module.exports = new CardController();
