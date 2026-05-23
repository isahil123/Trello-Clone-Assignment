const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");

async function startServer() {
  try {
    // Test the database connection before starting Express
    await prisma.$connect();
    app.locals.dbReady = true;
    console.log("✅ Connected to the database via Prisma");
  } catch (error) {
    app.locals.dbReady = false;
    console.error(
      "Database failed to connect, but server will respond with a clear API error.",
    );
    console.error("❌ Database connection error details:", error.message);
  }

  // Always start the Express server
  app.listen(env.port, () => {
    console.log(
      `🚀 Server running on http://localhost:${env.port} in ${env.nodeEnv} mode`,
    );
  });
}

startServer();
