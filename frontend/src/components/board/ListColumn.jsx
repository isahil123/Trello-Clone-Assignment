import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "react-hot-toast";
import apiClient from "../../api/client";
import SortableCard from "./SortableCard";
import CardSkeleton from "./CardSkeleton";
import useBoardStore from "../../store/useBoardStore";

const ListColumn = ({ list, cards, boardId, index, isDragOverlay }) => {
  const queryClient = useQueryClient();
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [addingCard, setAddingCard] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const listColor = "#282e33";

  const { searchQuery, filters } = useBoardStore();

  // Assignment requirement: Demo loading state for Shimmer effect
  const [isLoading, setIsLoading] = useState(true);

  // Turn off the demo loader after 3 seconds so you can see real cards
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const filteredCards = useMemo(() => {
    return (cards || []).filter((card) => {
      if (!card) return false;

      const keyword = (searchQuery || "").toLowerCase();
      if (
        keyword &&
        !(card.title || "").toLowerCase().includes(keyword) &&
        !(card.description || "").toLowerCase().includes(keyword)
      ) {
        return false;
      }

      if (filters.labels.length > 0) {
        const cardLabelColors = (card.labels || [])
          .map((l) => l?.label?.color ?? l?.color ?? l)
          .filter(Boolean);
        const hasAny = filters.labels.some((sel) =>
          cardLabelColors.includes(sel),
        );
        if (!hasAny) return false;
      }

      if (filters.members.length > 0) {
        const cardMemberIds = (card.members || []).map(
          (m) => m?.userId ?? m?.id,
        );
        if (filters.members.includes("none")) {
          if (cardMemberIds.length !== 0) return false;
        } else {
          const hasAllMembers = filters.members.every((id) =>
            cardMemberIds.includes(id),
          );
          if (!hasAllMembers) return false;
        }
      }

      if (filters.dueDate) {
        if (filters.dueDate === "noDates") {
          if (card.dueDate) return false;
        } else {
          if (filters.dueDate === "overdue") {
            if (!card.dueDate) return false;
            const due = new Date(card.dueDate);
            const now = new Date();
            if (!(due < now && !card.isCompleted)) return false;
          }
          if (filters.dueDate === "complete" && !card.isCompleted) return false;
          if (filters.dueDate === "incomplete" && card.isCompleted)
            return false;
        }
      }

      return true;
    });
  }, [cards, searchQuery, filters]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      setAddingCard(true);
      const nextPosition =
        cards.length > 0 ? cards[cards.length - 1].position + 1024 : 1024;

      await apiClient.post("/cards", {
        title: newCardTitle.trim(),
        listId: list.id,
        position: nextPosition,
      });
      setNewCardTitle("");
      setShowAddCard(false);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch (err) {
      toast.error("Could not add card");
    } finally {
      setAddingCard(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle.trim() === list.title) {
      setIsEditingTitle(false);
      setEditTitle(list.title);
      return;
    }
    setIsEditingTitle(false);
    try {
      await apiClient.patch(`/lists/${list.id}`, { title: editTitle.trim() });
    } catch (err) {
      toast.error("Failed to update title");
    }
  };

  const handleDeleteList = async () => {
    if (
      window.confirm(`Are you sure you want to delete list "${list.title}"?`)
    ) {
      try {
        await apiClient.delete(`/lists/${list.id}`);
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      } catch (err) {
        toast.error("Failed to delete list");
      }
    }
  };

  const toggleCollapse = async () => {
    try {
      await apiClient.patch(`/lists/${list.id}`, {
        isCollapsed: !list.isCollapsed,
      });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch (err) {
      toast.error("Failed to toggle list");
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (list.isCollapsed) {
    return (
      <div
        className={`list-column collapsed`}
        style={{
          backgroundColor: listColor,
          width: "40px",
          minWidth: "40px",
          cursor: "pointer",
        }}
        onClick={toggleCollapse}
      >
        <div
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            padding: "16px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: "14px" }}>{list.title}</span>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "2px 6px",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          >
            {cards.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`list-column ${isDragOverlay ? "drag-overlay" : ""}`}
      style={{ backgroundColor: listColor, color: "#cecfd2" }}
    >
      <div className="list-header" style={{ position: "relative" }}>
        {isEditingTitle ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
            className="list-title-input"
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexGrow: 1,
            }}
          >
            <h3
              className="list-title"
              onClick={() => setIsEditingTitle(true)}
              style={{ color: "#cecfd2" }}
            >
              {list.title}
            </h3>
            <span className="list-card-count" style={{ color: "#9fadbc" }}>
              {cards.length}
            </span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="list-menu-btn"
          title="Collapse list \"
          style={{ color: "#cecfd2" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 12H5M5 12L9 8M5 12L9 16M19 12L15 8M19 12L15 16" />
          </svg>
        </button>
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="list-menu-btn"
            title="List actions"
            style={{ color: "#cecfd2" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: "0",
                marginTop: "4px",
                backgroundColor: "#282e33",
                borderRadius: "3px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                width: "240px",
                zIndex: 1000,
                padding: "8px 0",
                color: "#b6c2cf",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "0 12px 8px",
                  borderBottom: "1px solid hsla(0,0%,100%,0.16)",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#9fadbc",
                  position: "relative",
                }}
              >
                List actions
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "0",
                    background: "none",
                    border: "none",
                    color: "#9fadbc",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ marginTop: "8px" }}>
                <div
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDeleteList();
                  }}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#f87168";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#b6c2cf";
                  }}
                >
                  Archive this list
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="list-cards">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <SortableContext
            items={filteredCards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredCards.length === 0 && !isDragOverlay && (
              <div className="empty-list-placeholder">
                No cards match filters
              </div>
            )}
            {filteredCards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                listId={list.id}
                boardId={boardId}
              />
            ))}
          </SortableContext>
        )}
      </div>

      {!isDragOverlay && (
        <div className="list-footer">
          {showAddCard ? (
            <form onSubmit={handleAddCard} className="add-card-form">
              <textarea
                autoFocus
                className="add-card-input"
                placeholder="Enter a title for this card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCard(e);
                  }
                  if (e.key === "Escape") {
                    setShowAddCard(false);
                    setNewCardTitle("");
                  }
                }}
              />
              <div className="add-card-actions">
                <button
                  type="submit"
                  className="add-card-submit"
                  disabled={addingCard}
                >
                  {addingCard ? "Adding..." : "Add card"}
                </button>
                <button
                  type="button"
                  className="add-card-cancel"
                  onClick={() => setShowAddCard(false)}
                >
                  ✕
                </button>
              </div>
            </form>
          ) : (
            <button
              className="add-card-btn"
              onClick={() => setShowAddCard(true)}
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              <span className="add-icon">+</span> Add a card
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ListColumn;
