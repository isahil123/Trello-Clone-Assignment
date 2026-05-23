const prisma = require('../config/prisma');

class LabelService {
  async getLabelsByBoard(boardId) {
    return await prisma.label.findMany({
      where: { boardId }
    });
  }

  async createLabel(boardId, title, color) {
    return await prisma.label.create({
      data: {
        boardId,
        title,
        color
      }
    });
  }
}

module.exports = new LabelService();
