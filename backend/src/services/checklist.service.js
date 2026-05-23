const prisma = require('../config/prisma');

class ChecklistService {
  // --- Checklists ---
  async getChecklistById(id) {
    return await prisma.checklist.findUnique({ where: { id } });
  }

  async createChecklist(data) {
    return await prisma.checklist.create({ data });
  }

  async updateChecklist(id, data) {
    return await prisma.checklist.update({ where: { id }, data });
  }

  async deleteChecklist(id) {
    return await prisma.checklist.delete({ where: { id } });
  }

  // --- Checklist Items ---
  async getItemById(id) {
    return await prisma.checklistItem.findUnique({ where: { id } });
  }

  async createItem(data) {
    return await prisma.checklistItem.create({ data });
  }

  async updateItem(id, data) {
    return await prisma.checklistItem.update({ where: { id }, data });
  }

  async deleteItem(id) {
    return await prisma.checklistItem.delete({ where: { id } });
  }

  async reorderItems(items) {
    // Run all position updates in a single transaction for data integrity
    const queries = items.map((item) =>
      prisma.checklistItem.update({
        where: { id: item.id },
        data: { position: item.position }
      })
    );
    return await prisma.$transaction(queries);
  }
}

module.exports = new ChecklistService();
