const searchService = require('../services/search.service');

class SearchController {
  async globalSearch(req, res) {
    try {
      const { q } = req.query;
      const results = await searchService.search(q);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      console.error('Error in search:', error);
      res.status(500).json({ success: false, error: 'Failed to perform search' });
    }
  }
}

module.exports = new SearchController();
