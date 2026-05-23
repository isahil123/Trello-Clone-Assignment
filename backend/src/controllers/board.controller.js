const boardService = require('../services/board.service');

class BoardController {
  async getAllBoards(req, res) {
    try {
      const boards = await boardService.getAllBoards();
      res.status(200).json({ success: true, data: boards });
    } catch (error) {
      console.error('Error fetching boards:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch boards' });
    }
  }

  async getBoardById(req, res) {
    try {
      const { boardId } = req.params;
      const board = await boardService.getBoardById(boardId);
      
      if (!board) {
        return res.status(404).json({ success: false, error: 'Board not found' });
      }

      res.status(200).json({ success: true, data: board });
    } catch (error) {
      console.error('Error fetching board:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch board' });
    }
  }

  async createBoard(req, res) {
    try {
      const { title, description } = req.body;

      // Basic input validation
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Board title is required' });
      }

      const board = await boardService.createBoard({ title, description });
      res.status(201).json({ success: true, data: board });
    } catch (error) {
      console.error('Error creating board:', error);
      res.status(500).json({ success: false, error: 'Failed to create board' });
    }
  }

  async updateBoard(req, res) {
    try {
      const { boardId } = req.params;
      const data = req.body;
      const board = await boardService.updateBoard(boardId, data);
      res.status(200).json({ success: true, data: board });
    } catch (error) {
      console.error('Error updating board:', error);
      res.status(500).json({ success: false, error: 'Failed to update board' });
    }
  }
}

module.exports = new BoardController();
