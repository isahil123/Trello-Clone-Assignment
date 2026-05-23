require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

// Reuse the workspace DATABASE_URL so local dev and seeding target the same DB.
const DIRECT_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5433/trello_clone?sslmode=disable";

const prisma = new PrismaClient({
  datasources: { db: { url: DIRECT_URL } },
});

async function main() {
  console.log("Cleaning existing data...");
  // Deleting boards and users will cascade and delete all related lists, cards, checklists, etc.
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const user1 = await prisma.user.create({
    data: { email: "user@example.com", name: "User" },
  });
  const user2 = await prisma.user.create({
    data: { email: "aarav.sharma@example.com", name: "Aarav Sharma" },
  });
  const user3 = await prisma.user.create({
    data: { email: "priya.patel@example.com", name: "Priya Patel" },
  });
  const user4 = await prisma.user.create({
    data: { email: "rohan.desai@example.com", name: "Rohan Desai" },
  });

  console.log("Creating board...");
  const board = await prisma.board.create({
    data: {
      title: "Internship Project Tracker",
      description: "Kanban board for my summer internship tasks",
      members: {
        create: [
          { userId: user1.id, role: "ADMIN" },
          { userId: user2.id, role: "MEMBER" },
          { userId: user3.id, role: "MEMBER" },
          { userId: user4.id, role: "MEMBER" },
        ],
      },
      labels: {
        create: [
          { title: "Bug", color: "RED" },
          { title: "Feature", color: "BLUE" },
          { title: "Urgent", color: "ORANGE" },
          { title: "Documentation", color: "GREEN" },
        ],
      },
      lists: {
        create: [
          { title: "Backlog", position: 1000 },
          { title: "To Do", position: 2000 },
          { title: "In Progress", position: 3000 },
          { title: "Done", position: 4000 },
        ],
      },
    },
    include: {
      lists: true,
      labels: true,
    },
  });

  const backlogList = board.lists.find((l) => l.title === "Backlog");
  const todoList = board.lists.find((l) => l.title === "To Do");
  const inProgressList = board.lists.find((l) => l.title === "In Progress");
  const doneList = board.lists.find((l) => l.title === "Done");

  const redLabel = board.labels.find((l) => l.color === "RED");
  const blueLabel = board.labels.find((l) => l.color === "BLUE");
  const orangeLabel = board.labels.find((l) => l.color === "ORANGE");

  console.log("Creating cards...");

  // 1. Backlog Card
  await prisma.card.create({
    data: {
      title: "Research competitor products",
      position: 1000,
      listId: backlogList.id,
      labels: {
        create: [{ labelId: blueLabel.id }],
      },
    },
  });

  // 2. To Do Card (with checklist, members, due date, labels)
  await prisma.card.create({
    data: {
      title: "Design database schema",
      description:
        "Create the Prisma schema for the Kanban board and write seed file.",
      position: 1000,
      listId: todoList.id,
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      labels: {
        create: [{ labelId: orangeLabel.id }],
      },
      members: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
      checklists: {
        create: {
          title: "Schema Tasks",
          items: {
            create: [
              { title: "Define entities", position: 1000, isCompleted: true },
              {
                title: "Add relationships",
                position: 2000,
                isCompleted: false,
              },
              {
                title: "Write seed script",
                position: 3000,
                isCompleted: false,
                assigneeId: user1.id,
                dueDate: new Date(Date.now() + 86400000),
              },
            ],
          },
        },
      },
    },
  });

  // 3. In Progress Card
  await prisma.card.create({
    data: {
      title: "Setup React + Vite project",
      position: 1000,
      listId: inProgressList.id,
      members: {
        create: [{ userId: user3.id }],
      },
    },
  });

  // 4. Done Card
  await prisma.card.create({
    data: {
      title: "Initial repository setup",
      position: 1000,
      listId: doneList.id,
      members: {
        create: [{ userId: user4.id }],
      },
    },
  });

  // 5. Archived Card
  await prisma.card.create({
    data: {
      title: "Old discarded UI mockup",
      description: "We decided to go with a different design system.",
      position: 2000,
      listId: doneList.id,
      isArchived: true,
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
