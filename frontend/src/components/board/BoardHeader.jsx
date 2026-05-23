import React, { useState } from "react";
import { toast } from "react-hot-toast";
import apiClient from "../../api/client";
import useBoardStore from "../../store/useBoardStore";
import FilterMenu from "./FilterMenu";
import ViewsMenu from "./ViewsMenu";
import VisibilityMenu from "./VisibilityMenu";
import BackgroundMenu from "./BackgroundMenu";

const BoardHeader = ({
  board,
  onBoardUpdated,
  onBoardDeleted,
  currentView,
  setCurrentView,
}) => {
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState(board?.title || "");

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);

  const { searchQuery, setSearchQuery } = useBoardStore();

  if (!board) return null;

  const handleSaveBoardTitle = async () => {
    if (!editBoardTitle.trim() || editBoardTitle.trim() === board.title) {
      setIsEditingBoardTitle(false);
      return;
    }
    try {
      const response = await apiClient.patch(`/boards/${board.id}`, {
        title: editBoardTitle.trim(),
      });
      if (onBoardUpdated) onBoardUpdated(response.data.data);
      setIsEditingBoardTitle(false);
    } catch (err) {
      toast.error("Failed to update board title");
      setIsEditingBoardTitle(false);
    }
  };

  const toggleStar = async () => {
    const newStatus = !board.isStarred;
    try {
      const response = await apiClient.patch(`/boards/${board.id}`, {
        isStarred: newStatus,
      });
      if (onBoardUpdated) onBoardUpdated(response.data.data);
    } catch (err) {
      toast.error("Failed to update star status");
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    try {
      const response = await apiClient.patch(`/boards/${board.id}`, {
        visibility: newVisibility,
      });
      toast.success(`Board visibility set to ${newVisibility}`);
      if (onBoardUpdated) onBoardUpdated(response.data.data);
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <div className="board-header">
      <div className="board-header-left">
        {isEditingBoardTitle ? (
          <input
            autoFocus
            className="board-title-input"
            value={editBoardTitle}
            onChange={(e) => setEditBoardTitle(e.target.value)}
            onBlur={handleSaveBoardTitle}
            onKeyDown={(e) => e.key === "Enter" && handleSaveBoardTitle()}
          />
        ) : (
          <h1
            className="board-title"
            onClick={() => setIsEditingBoardTitle(true)}
          >
            {board.title}
          </h1>
        )}
        <button
          className={`board-header-btn star-btn ${board.isStarred ? "starred" : ""}`}
          onClick={toggleStar}
        >
          {board.isStarred ? "★" : "☆"}
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="board-header-btn"
            onClick={() => setShowViewsMenu(!showViewsMenu)}
          >
            <span style={{ marginRight: "4px" }}>▤</span>{" "}
            {currentView || "Board"}
          </button>
          {showViewsMenu && (
            <ViewsMenu
              showViewsMenu={showViewsMenu}
              setShowViewsMenu={setShowViewsMenu}
              currentView={currentView || "Board"}
              setCurrentView={(view) => {
                setCurrentView(view);
                setShowViewsMenu(false);
              }}
            />
          )}
        </div>
        <div style={{ position: "relative" }}>
          <button
            className="board-header-btn"
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
          >
            {board.visibility === "Public" ? "🌐" : "👥"}{" "}
            {board.visibility || "Workspace"}
          </button>
          {showVisibilityMenu && (
            <VisibilityMenu
              showMenu={showVisibilityMenu}
              setShowMenu={setShowVisibilityMenu}
              currentVisibility={board.visibility || "Workspace"}
              setVisibility={handleVisibilityChange}
            />
          )}
        </div>

        <span className="header-divider">|</span>

        <div className="board-members">
          {(board.members || []).map((member) => (
            <div
              key={member.id}
              className="member-avatar"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              title={member.user?.name}
            >
              {member.user?.name
                ? member.user.name.charAt(0).toUpperCase()
                : "U"}
            </div>
          ))}
        </div>

        <button className="share-button" style={{ marginLeft: "8px" }}>
          <span style={{ marginRight: "4px" }}>👥</span> Share
        </button>
      </div>

      <div className="board-header-right">
        <input
          type="text"
          placeholder="Search cards... (/)"
          className="board-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="board-search-input"
        />

        <div style={{ position: "relative" }}>
          <button
            className="board-header-btn"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            Y Filters
          </button>
          {showFilterMenu && (
            <FilterMenu
              board={board}
              onClose={() => setShowFilterMenu(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
