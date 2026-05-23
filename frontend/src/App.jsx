import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import TopNav from "./components/layout/TopNav";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import HomePage from "./components/dashboard/HomePage";
import Board from "./components/board/Board";
import Templates from "./components/templates/Templates";
import { BoardProvider } from "./context/BoardContext";
import apiClient from "./api/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHomeBoards } from "./api/queries";
import "./index.css";

const queryClient = new QueryClient();

// Wrapper component for the board page
const BoardPage = ({ boards, isSidebarOpen, setSidebarOpen, onBoardUpdated, onBoardDeleted }) => {
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
          onBoardUpdated={onBoardUpdated}
          onBoardDeleted={onBoardDeleted}
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
        <Templates onBoardCreated={handleBoardCreated} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
    </>
  );
};



function AppContent() {
  const { data: homeBoards, isLoading: loading, error: fetchError } = useHomeBoards();
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (homeBoards) setBoards(homeBoards);
  }, [homeBoards]);

  useEffect(() => {
    if (fetchError) {
      const backendMessage = fetchError?.response?.data?.error;
      setError(
        backendMessage ||
          "Could not connect to the backend API. Is the server running?",
      );
    }
  }, [fetchError]);

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
        return prev.map((b) => (b.id === tempId ? newBoard : b));
      }
      if (prev.find((b) => b.id === newBoard.id)) return prev;
      return [...prev, newBoard];
    });
  };

  const handleBoardUpdated = (updatedBoard) => {
    setBoards((prev) => prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)));
  };

  const handleBoardDeleted = (deletedBoardId) => {
    setBoards((prev) => prev.filter((b) => b.id !== deletedBoardId));
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
            element={<Dashboard boards={boards} onBoardsLoaded={setBoards} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />}
          />
          <Route path="/home" element={<HomePage boards={boards} onBoardsLoaded={setBoards} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />} />
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
            path="/b/:boardId"
            element={
              <BoardPage
                boards={boards}
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onBoardUpdated={handleBoardUpdated}
                onBoardDeleted={handleBoardDeleted}
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <BoardProvider>
          <AppContent />
        </BoardProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
