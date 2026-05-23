const prisma = require('../config/prisma');

class BoardService {
  async getAllBoards() {
    // Fetch all boards, ordered by creation date
    return await prisma.board.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBoardById(boardId) {
    // Deeply nested fetch to retrieve the entire board state in one go.
    // This is highly optimal for a frontend Kanban board where the whole
    // UI needs to be rendered immediately upon loading the board.
    return await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        labels: true,
        members: {
          include: { user: true } // Include user details (name, email)
        },
        lists: {
          orderBy: { position: 'asc' }, // Maintain drag-and-drop order
          include: {
            cards: {
              orderBy: { position: 'asc' }, // Maintain drag-and-drop order
              include: {
                labels: {
                  include: { label: true } // Include label color/title
                },
                members: {
                  include: { user: true } // Include assigned user details
                },
                checklists: {
                  include: {
                    items: {
                      orderBy: { position: 'asc' },
                      include: { assignee: true } // Include item assignee
                    }
                  }
                },
                comments: {
                  orderBy: { createdAt: 'desc' },
                  include: { user: true }
                }
              }
            }
          }
        }
      }
    });
  }

  async createBoard(data) {
    const board = await prisma.board.create({
      data: {
        title: data.title,
        description: data.description || null
      }
    });

    try {
      if (data.title === 'My Tasks | Trello') {
        const todoList = await prisma.list.create({ data: { title: 'To Do', position: 1000, boardId: board.id } });
        const doingList = await prisma.list.create({ data: { title: 'Doing', position: 2000, boardId: board.id } });
        const doneList = await prisma.list.create({ data: { title: 'Done', position: 3000, boardId: board.id } });
        await prisma.card.create({ data: { title: 'Plan weekly meals', position: 1000, listId: todoList.id } });
        await prisma.card.create({ data: { title: 'Clean the garage', position: 2000, listId: todoList.id } });
        await prisma.card.create({ data: { title: 'Read Chapter 4', position: 1000, listId: doingList.id } });
      } else if (data.title === 'New Hire Onboarding') {
        const day1 = await prisma.list.create({ data: { title: 'Day 1', position: 1000, boardId: board.id } });
        const week1 = await prisma.list.create({ data: { title: 'Week 1', position: 2000, boardId: board.id } });
        await prisma.card.create({ data: { title: 'Set up laptop', position: 1000, listId: day1.id } });
        await prisma.card.create({ data: { title: 'Meet the team', position: 2000, listId: day1.id } });
        await prisma.card.create({ data: { title: 'Complete compliance training', position: 1000, listId: week1.id } });
      } else if (data.title === 'Tier List') {
        await prisma.list.create({ data: { title: 'S Tier', position: 1000, boardId: board.id } });
        await prisma.list.create({ data: { title: 'A Tier', position: 2000, boardId: board.id } });
        await prisma.list.create({ data: { title: 'B Tier', position: 3000, boardId: board.id } });
        const unranked = await prisma.list.create({ data: { title: 'Unranked', position: 4000, boardId: board.id } });
        await prisma.card.create({ data: { title: 'Item 1', position: 1000, listId: unranked.id } });
        await prisma.card.create({ data: { title: 'Item 2', position: 2000, listId: unranked.id } });
      } else {
        await prisma.list.create({ data: { title: 'To Do', position: 1000, boardId: board.id } });
        await prisma.list.create({ data: { title: 'Doing', position: 2000, boardId: board.id } });
        await prisma.list.create({ data: { title: 'Done', position: 3000, boardId: board.id } });
      }
    } catch (err) {
      console.error('Failed to populate template', err);
    }

    return board;
  }

  async updateBoard(boardId, data) {
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isStarred !== undefined) updateData.isStarred = data.isStarred;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;

    return await prisma.board.update({
      where: { id: boardId },
      data: updateData
    });
  }
}

module.exports = new BoardService();
