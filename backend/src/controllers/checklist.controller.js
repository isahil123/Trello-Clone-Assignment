const checklistService = require('../services/checklist.service');

class ChecklistController {
  // --- Checklists ---
  async createChecklist(req, res) {
    try {
      const { title, cardId } = req.body;

      if (!title || !cardId) {
        return res.status(400).json({ success: false, error: 'title and cardId are required' });
      }

      const checklist = await checklistService.createChecklist({ title, cardId });
      res.status(201).json({ success: true, data: checklist });
    } catch (error) {
      console.error('Error creating checklist:', error);
      res.status(500).json({ success: false, error: 'Failed to create checklist' });
    }
  }

  async updateChecklist(req, res) {
    try {
      const { checklistId } = req.params;
      const { title } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Checklist title is required' });
      }

      const existing = await checklistService.getChecklistById(checklistId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Checklist not found' });
      }

      const checklist = await checklistService.updateChecklist(checklistId, { title });
      res.status(200).json({ success: true, data: checklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
      res.status(500).json({ success: false, error: 'Failed to update checklist' });
    }
  }

  async deleteChecklist(req, res) {
    try {
      const { checklistId } = req.params;

      const existing = await checklistService.getChecklistById(checklistId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Checklist not found' });
      }

      await checklistService.deleteChecklist(checklistId);
      res.status(200).json({ success: true, message: 'Checklist deleted successfully' });
    } catch (error) {
      console.error('Error deleting checklist:', error);
      res.status(500).json({ success: false, error: 'Failed to delete checklist' });
    }
  }

  // --- Checklist Items ---
  async createItem(req, res) {
    try {
      const { title, checklistId, position } = req.body;

      if (!title || !checklistId || typeof position !== 'number') {
        return res.status(400).json({ success: false, error: 'title, checklistId, and position are required' });
      }

      const item = await checklistService.createItem({ title, checklistId, position });
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      console.error('Error creating checklist item:', error);
      res.status(500).json({ success: false, error: 'Failed to create checklist item' });
    }
  }

  async updateItem(req, res) {
    try {
      const { itemId } = req.params;
      const { title, isCompleted, dueDate, assigneeId } = req.body;

      const existing = await checklistService.getItemById(itemId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Checklist item not found' });
      }

      // Build update payload dynamically based on provided fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;

      const item = await checklistService.updateItem(itemId, updateData);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error('Error updating checklist item:', error);
      res.status(500).json({ success: false, error: 'Failed to update checklist item' });
    }
  }

  async deleteItem(req, res) {
    try {
      const { itemId } = req.params;

      const existing = await checklistService.getItemById(itemId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Checklist item not found' });
      }

      await checklistService.deleteItem(itemId);
      res.status(200).json({ success: true, message: 'Checklist item deleted successfully' });
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      res.status(500).json({ success: false, error: 'Failed to delete checklist item' });
    }
  }

  async reorderItems(req, res) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'An array of items with id and position is required' });
      }

      const result = await checklistService.reorderItems(items);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error reordering checklist items:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder checklist items' });
    }
  }
}

module.exports = new ChecklistController();
