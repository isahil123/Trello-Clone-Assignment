const prisma = require('../config/prisma');

class ListService {
  async getListById(listId) {
    return await prisma.list.findUnique({
      where: { id: listId }
    });
  }

  async createList(data) {
    return await prisma.list.create({
      data: {
        title: data.title,
        boardId: data.boardId,
        position: data.position
      }
    });
  }

  async updateList(listId, data) {
    return await prisma.list.update({
      where: { id: listId },
      data
    });
  }

  async deleteList(listId) {
    return await prisma.list.delete({
      where: { id: listId }
    });
  }

  async reorderLists(items) {
    // Run all position updates in a single transaction.
    // This ensures that if one update fails, the whole reorder is rolled back,
    // maintaining data integrity for drag-and-drop.
    const queries = items.map((item) =>
      prisma.list.update({
        where: { id: item.id },
        data: { position: item.position }
      })
    );
    return await prisma.$transaction(queries);
  }
}

module.exports = new ListService();
