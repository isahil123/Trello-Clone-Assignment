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

  async addComment(cardId, userId, text) {
    return await prisma.comment.create({
      data: { cardId, userId, text },
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
}

module.exports = new CardService();
