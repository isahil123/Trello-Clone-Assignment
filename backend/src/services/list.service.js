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

  async normalizePositions(listId) {
    const cards = await prisma.card.findMany({
      where: { listId },
      orderBy: { position: 'asc' }
    });
    const queries = cards.map((card, index) => 
      prisma.card.update({
        where: { id: card.id },
        data: { position: (index + 1) * 1024 }
      })
    );
    return await prisma.$transaction(queries);
  }

  async copyList(listId, newTitle, position) {
    const listToCopy = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        cards: {
          include: {
            labels: true,
            checklists: { include: { items: true } }
          }
        }
      }
    });

    if (!listToCopy) throw new Error('List not found');

    return await prisma.list.create({
      data: {
        title: newTitle || `${listToCopy.title} (Copy)`,
        boardId: listToCopy.boardId,
        position: position,
        cards: {
          create: listToCopy.cards.map(card => ({
            title: card.title,
            description: card.description,
            position: card.position,
            coverColor: card.coverColor,
            dueDate: card.dueDate,
            labels: {
              create: card.labels.map(l => ({ labelId: l.labelId }))
            },
            checklists: {
              create: card.checklists.map(cl => ({
                title: cl.title,
                items: {
                  create: cl.items.map(item => ({
                    title: item.title,
                    position: item.position,
                    isCompleted: item.isCompleted,
                    dueDate: item.dueDate
                  }))
                }
              }))
            }
          }))
        }
      },
      include: {
        cards: {
          include: {
            labels: { include: { label: true } },
            checklists: { include: { items: true } },
            members: { include: { user: true } },
            comments: true
          }
        }
      }
    });
  }
}

module.exports = new ListService();
