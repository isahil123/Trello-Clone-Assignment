const cardService = require('../services/card.service');

class CardController {
  async createCard(req, res) {
    try {
      const { title, listId, position } = req.body;

      if (!title || !listId || typeof position !== 'number') {
        return res.status(400).json({ success: false, error: 'title, listId, and position are required' });
      }

      const card = await cardService.createCard({ title, listId, position });
      res.status(201).json({ success: true, data: card });
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({ success: false, error: 'Failed to create card' });
    }
  }

  async updateCard(req, res) {
    try {
      const { cardId } = req.params;
      const { title, description, dueDate } = req.body;

      // Ensure at least one valid field is provided for the update
      if (title === undefined && description === undefined && dueDate === undefined) {
        return res.status(400).json({ success: false, error: 'title, description, or dueDate is required for update' });
      }

      const existingCard = await cardService.getCardById(cardId);
      if (!existingCard) {
        return res.status(404).json({ success: false, error: 'Card not found' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

      const card = await cardService.updateCard(cardId, updateData);
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
      res.status(200).json({ success: true, data: card });
    } catch (error) {
      console.error('Error archiving card:', error);
      res.status(500).json({ success: false, error: 'Failed to archive card' });
    }
  }

  async moveCards(req, res) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'An array of items with id, listId, and position is required' });
      }

      const result = await cardService.moveCards(items);
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
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to remove member' });
    }
  }

  async addComment(req, res) {
    try {
      const { cardId } = req.params;
      const { text, userId } = req.body; // In a real app, userId comes from req.user
      const comment = await cardService.addComment(cardId, userId, text);
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
}

module.exports = new CardController();
