const listService = require('../services/list.service');

class ListController {
  async createList(req, res) {
    try {
      const { title, boardId, position } = req.body;

      if (!title || !boardId || typeof position !== 'number') {
        return res.status(400).json({ success: false, error: 'title, boardId, and position are required' });
      }

      const list = await listService.createList({ title, boardId, position });
      res.status(201).json({ success: true, data: list });
    } catch (error) {
      console.error('Error creating list:', error);
      res.status(500).json({ success: false, error: 'Failed to create list' });
    }
  }

  async updateList(req, res) {
    try {
      const { listId } = req.params;
      const { title } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'List title is required' });
      }

      // Verify list exists before updating
      const existingList = await listService.getListById(listId);
      if (!existingList) {
        return res.status(404).json({ success: false, error: 'List not found' });
      }

      const list = await listService.updateList(listId, { title });
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      console.error('Error updating list:', error);
      res.status(500).json({ success: false, error: 'Failed to update list' });
    }
  }

  async deleteList(req, res) {
    try {
      const { listId } = req.params;

      // Verify list exists before deleting
      const existingList = await listService.getListById(listId);
      if (!existingList) {
        return res.status(404).json({ success: false, error: 'List not found' });
      }

      await listService.deleteList(listId);
      res.status(200).json({ success: true, message: 'List deleted successfully' });
    } catch (error) {
      console.error('Error deleting list:', error);
      res.status(500).json({ success: false, error: 'Failed to delete list' });
    }
  }

  async reorderLists(req, res) {
    try {
      const { items } = req.body;

      // Validate that items is a non-empty array
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'An array of items with id and position is required' });
      }

      const result = await listService.reorderLists(items);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error reordering lists:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder lists' });
    }
  }
}

module.exports = new ListController();
