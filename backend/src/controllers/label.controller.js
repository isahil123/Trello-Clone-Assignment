const labelService = require('../services/label.service');

class LabelController {
  async getLabels(req, res) {
    try {
      const { boardId } = req.params;
      const labels = await labelService.getLabelsByBoard(boardId);
      res.status(200).json({ success: true, data: labels });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to fetch labels' });
    }
  }

  async createLabel(req, res) {
    try {
      const { boardId } = req.params;
      const { title, color } = req.body;
      const label = await labelService.createLabel(boardId, title, color);
      res.status(201).json({ success: true, data: label });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to create label' });
    }
  }
}

module.exports = new LabelController();
