import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import TopNav from "./components/layout/TopNav";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import HomePage from "./components/dashboard/HomePage";
import Board from "./components/board/Board";
import Templates from "./components/templates/Templates";
import WorkspacePage from "./components/workspace/WorkspacePage";
import { BoardProvider } from "./context/BoardContext";
import apiClient from "./api/client";
import "./index.css";

// Wrapper component for the board page
const BoardPage = ({ boards, isSidebarOpen, setSidebarOpen }) => {
  const { boardId } = useParams();
  return (
    <>
      <Sidebar
        boards={boards}
        activeBoardId={boardId}
        isOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div
        className="content-area"
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Board
          boardId={boardId}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          boards={boards}
        />
      </div>
    </>
  );
};

// Wrapper for templates page
const TemplatesPage = ({
  boards,
  setBoards,
  isSidebarOpen,
  setSidebarOpen,
}) => {
  const handleBoardCreated = (newBoard) => {
    setBoards((prev) => [...prev, newBoard]);
  };
  return (
    <>
      <div className="content-area" style={{ width: "100%", display: "flex" }}>
        <Templates onBoardCreated={handleBoardCreated} />
      </div>
    </>
  );
};

// Wrapper for Workspace pages (Members, Settings, etc.)
const WorkspaceRoute = ({ boards, isSidebarOpen, setSidebarOpen }) => {
  return (
    <>
      <div className="content-area" style={{ width: "100%", display: "flex" }}>
        <WorkspacePage />
      </div>
    </>
  );
};

function AppContent() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle state

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await apiClient.get("/boards");
        setBoards(response.data.data || []);
      } catch (err) {
        console.error(err);
        const backendMessage = err?.response?.data?.error;
        setError(
          backendMessage ||
            "Could not connect to the backend API. Is the server running?",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <TopNav setSidebarOpen={setSidebarOpen} />
        <div className="main-layout">
          <div className="shimmer-dashboard">
            <div className="shimmer shimmer-hero"></div>
            <div className="shimmer shimmer-recent-title"></div>
            <div className="shimmer-recent-items">
              <div className="shimmer shimmer-recent-item"></div>
              <div className="shimmer shimmer-recent-item"></div>
              <div className="shimmer shimmer-recent-item"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <TopNav setSidebarOpen={setSidebarOpen} />
        <div className="main-layout">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  // Called by TopNav's Create Board Modal (optimistic UI)
  // First call: newBoard has a temp id — insert optimistically
  // Second call (on API success): includes tempId — replace the temp entry
  const handleBoardCreated = (newBoard, tempId = null) => {
    setBoards((prev) => {
      if (tempId) {
        // Reconcile: swap temp entry for real server board
        return prev.map((b) => (b.id === tempId ? newBoard : b));
      }
      // Optimistic insert (no duplicate guard)
      if (prev.find((b) => b.id === newBoard.id)) return prev;
      return [...prev, newBoard];
    });
  };

  return (
    <div className="app-container">
      <TopNav
        setSidebarOpen={setSidebarOpen}
        onBoardCreated={handleBoardCreated}
      />
      <div className="main-layout">
        <Routes>
          <Route
            path="/"
            element={<Dashboard boards={boards} onBoardsLoaded={setBoards} />}
          />
          <Route path="/home" element={<HomePage boards={boards} />} />
          <Route
            path="/templates"
            element={
              <TemplatesPage
                boards={boards}
                setBoards={setBoards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/members"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/settings/profile"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/settings/activity"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/settings/cards"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/settings/account"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/settings/labs"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/billing"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/power-ups"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/export"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/linked-projects"
            element={
              <WorkspaceRoute
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
          <Route
            path="/b/:boardId"
            element={
              <BoardPage
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </BrowserRouter>
  );
}

export default App;
