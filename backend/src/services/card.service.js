const prisma = require('../config/prisma');

class CardService {
  async getCardById(cardId) {
    return await prisma.card.findUnique({
      where: { id: cardId }
    });
  }

  async createCard(data) {
    return await prisma.card.create({
      data: {
        title: data.title,
        listId: data.listId,
        position: data.position
      }
    });
  }

  async updateCard(cardId, data) {
    return await prisma.card.update({
      where: { id: cardId },
      data
    });
  }

  async createCardFromTemplate(templateCardId, listId, position) {
    const templateCard = await prisma.card.findUnique({
      where: { id: templateCardId },
      include: { labels: true, checklists: { include: { items: true } } }
    });

    if (!templateCard) throw new Error('Template card not found');

    return await prisma.card.create({
      data: {
        title: templateCard.title,
        description: templateCard.description,
        listId: listId,
        position: position,
        isTemplate: false,
        labels: {
          create: templateCard.labels.map(l => ({ labelId: l.labelId }))
        },
        checklists: {
          create: templateCard.checklists.map(cl => ({
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
      },
      include: { labels: { include: { label: true } }, checklists: { include: { items: true } }, members: { include: { user: true } }, comments: true }
    });
  }

  async deleteCard(cardId) {
    return await prisma.card.delete({
      where: { id: cardId }
    });
  }

  async moveCards(items) {
    // Run all card position and listId updates in a single transaction.
    // This allows bulk updating multiple cards when dragging across lists,
    // ensuring the database stays consistent even if one query fails.
    const queries = items.map((item) =>
      prisma.card.update({
        where: { id: item.id },
        data: {
          position: item.position,
          listId: item.listId // Enables moving the card to a entirely new list
        }
      })
    );
    return await prisma.$transaction(queries);
  }

  // --- Card Details (Labels, Members, Comments) ---

  async addLabelToCard(cardId, labelId) {
    return await prisma.cardLabel.create({
      data: { cardId, labelId }
    });
  }

  async removeLabelFromCard(cardId, labelId) {
    return await prisma.cardLabel.delete({
      where: {
        cardId_labelId: { cardId, labelId }
      }
    });
  }

  async addMemberToCard(cardId, userId) {
    return await prisma.cardMember.create({
      data: { cardId, userId }
    });
  }

  async removeMemberFromCard(cardId, userId) {
    return await prisma.cardMember.delete({
      where: {
        cardId_userId: { cardId, userId }
      }
    });
  }

  async addComment(cardId, userId, text, isActivity = false) {
    return await prisma.comment.create({
      data: { cardId, userId, text, isActivity },
      include: { user: true }
    });
  }

  async getCommentsByCard(cardId) {
    return await prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
  }

  // --- Checklists ---

  async addChecklist(cardId, title) {
    return await prisma.checklist.create({
      data: { cardId, title }
    });
  }

  async deleteChecklist(checklistId) {
    return await prisma.checklist.delete({
      where: { id: checklistId }
    });
  }

  async addChecklistItem(checklistId, title, position) {
    return await prisma.checklistItem.create({
      data: { checklistId, title, position }
    });
  }

  async updateChecklistItem(itemId, data) {
    return await prisma.checklistItem.update({
      where: { id: itemId },
      data
    });
  }

  async deleteChecklistItem(itemId) {
    return await prisma.checklistItem.delete({
      where: { id: itemId }
    });
  }
}

module.exports = new CardService();
