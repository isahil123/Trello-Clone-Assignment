const prisma = require('../config/prisma');

class SearchService {
  async search(query) {
    if (!query || typeof query !== 'string') {
      return { boards: [], cards: [] };
    }
    
    const searchTerm = query.trim();
    if (searchTerm === '') {
      return { boards: [], cards: [] };
    }

    // Search boards by title
    const boards = await prisma.board.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      take: 5,
    });

    // Search cards by title or description
    const cards = await prisma.card.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
      take: 10,
    });

    return { boards, cards };
  }
}

module.exports = new SearchService();
