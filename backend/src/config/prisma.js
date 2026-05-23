const { PrismaClient } = require('@prisma/client');

// Prevent multiple instances of Prisma Client in development
// which can exhaust database connections when using nodemon
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

module.exports = prisma;
