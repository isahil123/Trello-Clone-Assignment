const express = require("express");
const cors = require("cors");
const boardRoutes = require("./routes/board.routes");
const listRoutes = require("./routes/list.routes");
const cardRoutes = require("./routes/card.routes");
const checklistRoutes = require("./routes/checklist.routes");
const searchRoutes = require("./routes/search.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Global Middlewares
app.use(cors({ origin: true, credentials: true })); // Allow requests from frontend
app.use(express.json()); // Parse incoming JSON request bodies

// Health check route to verify server is running
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is alive and CORS is working!" });
});

// If Prisma could not connect at startup, return a clear 503 for API routes.
app.use((req, res, next) => {
  if (req.path !== "/api/health" && app.locals.dbReady === false) {
    return res.status(503).json({
      success: false,
      error:
        "Database connection failed. Check DATABASE_URL and restart the backend.",
    });
  }

  next();
});

// We will add feature routes (boards, lists, cards) here later
app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", userRoutes);

const path = require("path");

// Basic 404 handler for unknown API routes
app.use("/api", (req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Serve frontend in production
const frontendPath = path.join(__dirname, "../../../frontend/dist");
app.use(express.static(frontendPath));

// Fallback to React app
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;
