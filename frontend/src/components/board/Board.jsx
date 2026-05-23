import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";

import { useBoardData } from "../../api/queries";
import { useMoveCard, useMoveList } from "../../api/mutations";
import useBoardStore from "../../store/useBoardStore";
import { useBoard } from "../../context/BoardContext";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import { getMidPosition, checkAndNormalize } from "../../utils/lexoRank";
import apiClient from "../../api/client";

import BoardHeader from "./BoardHeader";
import ListContainer from "./ListContainer";
import ListColumn from "./ListColumn";
import CardItem from "./CardItem";
import CardModal from "./CardModal";
import NotificationSidebar from "./NotificationSidebar";
import "./Board.css";

const Board = ({ boardId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: board, isLoading, error } = useBoardData(boardId);
  const { currentView, setCurrentView } = useBoard();

  const moveCardMutation = useMoveCard();
  const moveListMutation = useMoveList();

  const {
    activeDragItem,
    setActiveDragItem,
    activeCardId,
    setActiveCardId,
    quickEditCard,
    setQuickEditCard,
    setSidebarOpen,
    searchQuery,
    filters,
  } = useBoardStore();
  const { clearFilters } = useBoardStore();

  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [addingList, setAddingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useKeyboardShortcuts({
    onAddList: () => setShowAddList(true),
    onSearch: () => document.getElementById("board-search-input")?.focus(),
  });

  // Ensure any stale filters are cleared when opening the board to avoid hiding all cards.
  useEffect(() => {
    clearFilters();
  }, [clearFilters]);

  const lists = board?.lists || [];

  // Filter cards on the frontend according to searchQuery and filters from the store.
  const filteredLists = useMemo(() => {
    const keyword = (searchQuery || "").trim().toLowerCase();
    const today = new Date();

    return (lists || []).map((list) => {
      const filteredCards = (list.cards || []).filter((card) => {
        // Safe access with optional chaining
        const title = (card?.title || "").toString().toLowerCase();
        const desc = (card?.description || "").toString().toLowerCase();

        // Keyword search
        if (keyword) {
          if (!title.includes(keyword) && !desc.includes(keyword)) return false;
        }

        // Members filter
        if (filters?.members?.length > 0) {
          if (filters.members.includes("none")) {
            // Keep only cards with no members
            if ((card?.members?.length ?? 0) !== 0) return false;
          } else {
            const cardMemberIds = (card?.members || [])
              .map((m) => m?.userId ?? m?.id)
              .filter(Boolean);
            // require all selected members to be present
            const hasAll = filters.members.every((id) =>
              cardMemberIds.includes(id),
            );
            if (!hasAll) return false;
          }
        }

        // Due date filter
        if (filters?.dueDate) {
          if (filters.dueDate === "noDates") {
            if (card?.dueDate) return false;
          } else {
            if (filters.dueDate === "overdue") {
              if (!card?.dueDate) return false;
              const due = new Date(card.dueDate);
              if (!(due < today && !card?.isCompleted)) return false;
            }
            if (filters.dueDate === "complete") {
              if (!card?.isCompleted) return false;
            }
            if (filters.dueDate === "incomplete") {
              if (card?.isCompleted) return false;
            }
          }
        }

        // Labels filter (match by color key or string)
        if (filters?.labels?.length > 0) {
          const cardLabelColors = (card?.labels || [])
            .map((l) => l?.label?.color ?? l?.color ?? l)
            .filter(Boolean);
          const hasAny = filters.labels.some((sel) =>
            cardLabelColors.includes(sel),
          );
          if (!hasAny) return false;
        }

        return true;
      });

      return { ...list, cards: filteredCards };
    });
  }, [lists, searchQuery, filters]);

  if (isLoading) {
    return (
      <div className="board-loading-skeleton">
        <div className="skeleton-header"></div>
        <div className="skeleton-lists">
          <div className="skeleton-list"></div>
          <div className="skeleton-list"></div>
          <div className="skeleton-list"></div>
        </div>
      </div>
    );
  }

  if (error || !board)
    return <div className="error-message">Failed to load board</div>;

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      setAddingList(true);
      const nextPosition =
        lists.length > 0 ? lists[lists.length - 1].position + 1024 : 1024;
      await apiClient.post("/lists", {
        title: newListTitle.trim(),
        boardId: board.id,
        position: nextPosition,
      });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setNewListTitle("");
      setShowAddList(false);
    } catch (err) {
      toast.error("Failed to add list");
    } finally {
      setAddingList(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragItem({
      id: active.id,
      type: active.data.current?.type,
      card: active.data.current?.card,
      list: active.data.current?.list,
      listId: active.data.current?.listId,
    });
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "List") return; // Lists only move onDragEnd

    const activeListId = active.data.current?.listId;
    let overListId = overType === "List" ? over.id : over.data.current?.listId;

    if (!overListId || activeListId === overListId) return;

    // Optimistic cross-list move during drag
    queryClient.setQueryData(["board", boardId], (old) => {
      const activeListIndex = old.lists.findIndex((l) => l.id === activeListId);
      const overListIndex = old.lists.findIndex((l) => l.id === overListId);

      const newLists = [...old.lists];
      const activeList = {
        ...newLists[activeListIndex],
        cards: [...newLists[activeListIndex].cards],
      };
      const overList = {
        ...newLists[overListIndex],
        cards: [...newLists[overListIndex].cards],
      };

      const cardIndex = activeList.cards.findIndex((c) => c.id === active.id);
      const [movedCard] = activeList.cards.splice(cardIndex, 1);

      let insertIndex = overList.cards.length;
      if (overType === "Card") {
        insertIndex = overList.cards.findIndex((c) => c.id === over.id);
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        insertIndex =
          insertIndex >= 0 ? insertIndex + modifier : overList.cards.length;
      }

      movedCard.listId = overListId;
      overList.cards.splice(insertIndex, 0, movedCard);

      newLists[activeListIndex] = activeList;
      newLists[overListIndex] = overList;

      // Update activeDragItem's listId so it knows it moved
      active.data.current.listId = overListId;

      return { ...old, lists: newLists };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType === "List") {
      const activeIndex = lists.findIndex((l) => l.id === active.id);
      const overIndex = lists.findIndex((l) => l.id === over.id);

      if (activeIndex === overIndex) return;

      const newLists = [...lists];
      const [movedList] = newLists.splice(activeIndex, 1);
      newLists.splice(overIndex, 0, movedList);

      const prevPos = newLists[overIndex - 1]?.position;
      const nextPos = newLists[overIndex + 1]?.position;
      const newPos = getMidPosition(prevPos, nextPos);

      movedList.position = newPos;

      queryClient.setQueryData(["board", boardId], (old) => ({
        ...old,
        lists: newLists,
      }));

      try {
        await moveListMutation.mutateAsync([
          { id: movedList.id, position: newPos },
        ]);
      } catch (err) {
        toast.error("Failed to move list");
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      }
      return;
    }

    if (activeType === "Card") {
      const overListId =
        over.data.current?.type === "List"
          ? over.id
          : over.data.current?.listId;

      const currentBoard = queryClient.getQueryData(["board", boardId]);
      const listIndex = currentBoard.lists.findIndex(
        (l) => l.id === overListId,
      );
      if (listIndex === -1) return;

      const list = currentBoard.lists[listIndex];
      const oldIndex = list.cards.findIndex((c) => c.id === active.id);

      if (oldIndex === -1) return; // Should not happen due to optimistic onDragOver

      let newIndex;
      if (over.data.current?.type === "List") {
        newIndex = list.cards.length; // Drop on empty list
      } else {
        newIndex = list.cards.findIndex((c) => c.id === over.id);
        if (newIndex === -1) newIndex = list.cards.length;

        // dnd-kit gives us the exact intersection element.
        // We use arrayMove which will shift items appropriately.
      }

      // Reorder array logically BEFORE computing new positions
      const newCards = arrayMove(list.cards, oldIndex, newIndex);

      const prevCard = newCards[newIndex - 1];
      const nextCard = newCards[newIndex + 1];
      const newPos = getMidPosition(prevCard?.position, nextCard?.position);

      newCards[newIndex] = { ...newCards[newIndex], position: newPos };

      // Update cache
      const newLists = [...currentBoard.lists];
      newLists[listIndex] = { ...list, cards: newCards };
      queryClient.setQueryData(["board", boardId], (old) => ({
        ...old,
        lists: newLists,
      }));

      try {
        await moveCardMutation.mutateAsync([
          { id: active.id, listId: overListId, position: newPos },
        ]);

        // Check for normalization
        if (
          prevCard?.position &&
          Math.abs(newPos - prevCard.position) < 0.001
        ) {
          await apiClient.post(`/lists/${overListId}/normalize`);
          queryClient.invalidateQueries({ queryKey: ["board", boardId] });
        }
      } catch (err) {
        toast.error("Failed to move card");
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  return (
    <div
      className="board-page"
      style={{
        height: "100vh",
        overflowX: "auto",
      }}
    >
      <BoardHeader
        board={board}
        onBoardUpdated={(updatedBoard) => {
          queryClient.setQueryData(["board", boardId], (oldData) => ({
            ...oldData,
            ...updatedBoard,
          }));
          queryClient.invalidateQueries({ queryKey: ["boards"] });
        }}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <div className="board-canvas">
        {(!currentView || currentView === "Board") && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <ListContainer lists={filteredLists} boardId={boardId} />

            <DragOverlay dropAnimation={dropAnimation}>
              {activeDragItem?.type === "List" ? (
                <ListColumn
                  list={activeDragItem.list}
                  cards={activeDragItem.list.cards}
                  boardId={boardId}
                  isDragOverlay
                />
              ) : activeDragItem?.type === "Card" ? (
                <div style={{ transform: "rotate(2deg)" }}>
                  <CardItem
                    card={activeDragItem.card}
                    listId={activeDragItem.listId}
                    boardId={boardId}
                    isDragging
                  />
                </div>
              ) : null}
            </DragOverlay>

            <div className="add-list-wrapper">
              {showAddList ? (
                <form onSubmit={handleAddList} className="add-list-form">
                  <input
                    autoFocus
                    className="add-list-input"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                  <div className="add-list-actions">
                    <button
                      type="submit"
                      className="add-list-submit"
                      disabled={addingList}
                    >
                      {addingList ? "Adding..." : "Add list"}
                    </button>
                    <button
                      type="button"
                      className="add-list-cancel"
                      onClick={() => setShowAddList(false)}
                    >
                      ✕
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="add-list-btn"
                  onClick={() => setShowAddList(true)}
                >
                  <span className="add-icon">+</span> Add another list
                </button>
              )}
            </div>
          </DndContext>
        )}

        {currentView === "Calendar" && (
          <div
            style={{
              padding: "20px",
              color: "#fff",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#fff" }}>📅 Calendar View</h2>
            <p>
              Premium feature. Your tasks will appear on a calendar layout here.
            </p>
          </div>
        )}

        {currentView === "Table" && (
          <div style={{ padding: "20px", color: "#fff", width: "100%" }}>
            <h2 style={{ color: "#fff" }}>🗄️ Table View</h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "16px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px" }}>Card Name</th>
                  <th style={{ padding: "8px" }}>List</th>
                </tr>
              </thead>
              <tbody>
                {lists
                  .flatMap((l) =>
                    (l.cards || []).map((c) => ({ ...c, listName: l.title })),
                  )
                  .map((card) => (
                    <tr
                      key={card.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <td style={{ padding: "8px" }}>{card.title}</td>
                      <td style={{ padding: "8px" }}>{card.listName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {currentView === "Dashboard" && (
          <div
            style={{
              padding: "20px",
              color: "#fff",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#fff" }}>📊 Dashboard View</h2>
            <p>Premium feature. Analytics and charts will appear here.</p>
          </div>
        )}
      </div>

      {activeCardId && (
        <CardModal
          card={lists
            .flatMap((l) => l.cards || [])
            .find((c) => c.id === activeCardId)}
          boardId={boardId}
          onClose={() => setActiveCardId(null)}
        />
      )}

      {/* Floating Bottom Nav Dock */}
      <div className="bottom-nav-pill">
        <button
          type="button"
          className="bottom-nav-btn active"
          onClick={() => navigate(`/b/${boardId}`)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H4.99C3.88 3 3 3.89 3 5v14c0 1.1.89 2 2 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 16H5V5h14v14z" />
            <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-4h2v12h-2z" />
          </svg>
          Board
        </button>
        <div className="bottom-nav-divider" />
        <button
          type="button"
          className="bottom-nav-btn"
          onClick={() => navigate("/")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
          </svg>
          Switch boards
        </button>
      </div>

      <NotificationSidebar board={board} />
    </div>
  );
};

export default Board;
