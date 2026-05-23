import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";
import useBoardStore from "../../store/useBoardStore";

const LABEL_COLOR_MAP = {
  RED: "#f87168",
  BLUE: "#579dff",
  GREEN: "#4bce97",
  YELLOW: "#f5cd47",
  PURPLE: "#9f8fef",
  ORANGE: "#fea362",
  SKY: "#6cc3e0",
  PINK: "#e774bb",
  BLACK: "#8c9bab",
};

const CardItem = ({ card, listId, boardId, isDragging }) => {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const { searchQuery, filters, setActiveCardId } = useBoardStore();

  const handleToggleCompleted = async (e) => {
    e.stopPropagation();
    const next = !card.isCompleted;

    queryClient.setQueryData(["board", boardId], (old) => {
      if (!old?.lists) return old;
      return {
        ...old,
        lists: old.lists.map((list) => ({
          ...list,
          cards: (list.cards || []).map((c) =>
            c.id === card.id ? { ...c, isCompleted: next } : c,
          ),
        })),
      };
    });

    try {
      await apiClient.patch(`/cards/${card.id}`, { isCompleted: next });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  };

  const isMatch = () => {
    if (
      !searchQuery &&
      filters.labels.length === 0 &&
      filters.members.length === 0 &&
      !filters.dueDate
    ) {
      return true;
    }

    // AND logic
    if (
      searchQuery &&
      !card.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(card.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (filters.labels.length > 0) {
      // filters.labels contains label color keys (e.g. 'RED'), while card.labels store label objects with `label.color`.
      const cardLabelColors = (card.labels || [])
        .map((l) => (l.label || {}).color)
        .filter(Boolean);
      const hasAnyLabel = filters.labels.some((filterKey) =>
        cardLabelColors.includes(filterKey),
      );
      if (!hasAnyLabel) return false;
    }

    if (filters.members.length > 0) {
      const cardMemberIds = (card.members || []).map((m) => m.userId);
      // If 'none' is selected and card has no members, it's a match.
      // Or if it matches all the specified memberIds.
      if (filters.members.includes("none") && cardMemberIds.length === 0) {
        // match
      } else {
        const hasAllMembers = filters.members
          .filter((id) => id !== "none")
          .every((mId) => cardMemberIds.includes(mId));
        if (
          !hasAllMembers ||
          (filters.members.length === 1 && filters.members[0] === "none")
        )
          return false;
      }
    }

    if (filters.dueDate) {
      if (filters.dueDate === "noDates" && card.dueDate) return false;
      if (filters.dueDate !== "noDates" && !card.dueDate) return false;

      if (card.dueDate) {
        const due = new Date(card.dueDate);
        const now = new Date();
        if (filters.dueDate === "overdue" && (due >= now || card.isCompleted))
          return false;
        if (filters.dueDate === "complete" && !card.isCompleted) return false;
        if (filters.dueDate === "incomplete" && card.isCompleted) return false;
      }
    }

    return true;
  };

  const matchesFilters = isMatch();

  // Due date styling
  let dueDateBgColor = "transparent";
  let dueDateColor = "#9fadbc";
  let isOverdue = false;
  let isDueSoon = false;

  if (card.dueDate) {
    const due = new Date(card.dueDate);
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    if (card.isCompleted) {
      dueDateBgColor = "#1f845a";
      dueDateColor = "#fff";
    } else if (due < now) {
      dueDateBgColor = "#f87168";
      dueDateColor = "#fff";
      isOverdue = true;
    } else if (due <= twoDaysFromNow) {
      dueDateBgColor = "#f5cd47";
      dueDateColor = "#1d2125";
      isDueSoon = true;
    }
  }

  return (
    <div
      className="card-item-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setActiveCardId(card.id)}
      style={{
        ...styles.card,
        backgroundColor: isHovered ? "#2c333a" : "#22272b",
        padding:
          card.coverColor || card.coverImage ? "0 0 4px" : "8px 12px 4px",
        outline:
          matchesFilters && (searchQuery || filters.labels.length > 0)
            ? "2px solid #579dff"
            : isHovered
              ? "2px solid #579dff"
              : "1px solid transparent",
        boxShadow: isDragging
          ? "0 8px 16px rgba(0,0,0,0.4)"
          : isHovered
            ? "0 2px 4px rgba(0,0,0,0.2)"
            : "0 1px 1px rgba(0,0,0,0.1)",
        transform: isHovered && !isDragging ? "translateY(-2px)" : "none",
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.3 : matchesFilters ? 1 : 0.3,
        overflow: "hidden",
      }}
    >
      {card.coverImage ? (
        <div
          style={{
            height: "140px",
            backgroundImage: `url(${card.coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            marginBottom: "8px",
          }}
        />
      ) : (
        card.coverColor && (
          <div
            style={{
              height: "32px",
              backgroundColor: card.coverColor,
              width: "100%",
              marginBottom: "8px",
            }}
          />
        )
      )}

      <div
        style={{
          padding: card.coverColor || card.coverImage ? "0 12px 4px" : "0",
        }}
      >
        {card.labels && card.labels.length > 0 && (
          <div style={styles.labels}>
            {card.labels.map((cardLabel) => {
              const colorKey = cardLabel.label?.color;
              const bgColor = LABEL_COLOR_MAP[colorKey] || "#b3bac5";
              return (
                <span
                  key={cardLabel.id}
                  style={{ ...styles.label, backgroundColor: bgColor }}
                  title={cardLabel.label?.title || ""}
                />
              );
            })}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              flex: 1,
              cursor: "pointer",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={!!card.isCompleted}
              onChange={handleToggleCompleted}
              onClick={(e) => e.stopPropagation()}
              style={{ marginTop: 4, cursor: "pointer" }}
            />
            <h4
              style={{
                ...styles.title,
                textDecoration: card.isCompleted ? "line-through" : "none",
                opacity: card.isCompleted ? 0.8 : 1,
              }}
            >
              {card.title}
            </h4>
          </label>
          {isHovered && (
            <button
              style={{
                background: "#22272b",
                border: "none",
                color: "#9fadbc",
                borderRadius: "3px",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                useBoardStore.getState().setActiveCardId(card.id);
              }}
            >
              ✎
            </button>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.badges}>
            {card.description && <span style={styles.badgeIcon}>≡</span>}
            {card.comments && card.comments.length > 0 && (
              <span style={styles.badgeIcon}>💬 {card.comments.length}</span>
            )}
            {card.dueDate && (
              <span
                style={{
                  ...styles.badgeIcon,
                  ...styles.dueDateBadge,
                  backgroundColor: dueDateBgColor,
                  color: dueDateColor,
                  padding: dueDateBgColor !== "transparent" ? "0 4px" : "0",
                }}
              >
                {card.isCompleted ? "✓" : "🕒"}{" "}
                {new Date(card.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {card.checklists &&
              card.checklists.length > 0 &&
              (() => {
                const totalItems = card.checklists.reduce(
                  (acc, c) => acc + (c.items ? c.items.length : 0),
                  0,
                );
                const completedItems = card.checklists.reduce(
                  (acc, c) =>
                    acc +
                    (c.items ? c.items.filter((i) => i.isCompleted).length : 0),
                  0,
                );
                return totalItems > 0 ? (
                  <span
                    style={{
                      ...styles.badgeIcon,
                      backgroundColor:
                        totalItems === completedItems
                          ? "#1f845a"
                          : "transparent",
                      color:
                        totalItems === completedItems ? "#ffffff" : "#9fadbc",
                      padding: totalItems === completedItems ? "0 4px" : "0",
                      borderRadius: "3px",
                    }}
                  >
                    ☑ {completedItems}/{totalItems}
                  </span>
                ) : null;
              })()}
          </div>
          {card.members && card.members.length > 0 && (
            <div style={styles.members}>
              {card.members.map((member) => {
                const name = member.user?.name || member.name || "User";
                const initial = name.charAt(0).toUpperCase();
                return (
                  <div
                    key={member.id}
                    style={{
                      ...styles.memberAvatar,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1d2125",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {initial}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    borderRadius: "8px",
    padding: "8px 12px 4px",
    marginBottom: "8px",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "20px",
    wordWrap: "break-word",
    transition:
      "background-color 0.15s ease, outline 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: "400",
    color: "#cecfd2",
    lineHeight: "20px",
  },
  labels: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  label: {
    width: "40px",
    height: "8px",
    borderRadius: "4px",
    display: "inline-block",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
    minHeight: "16px",
  },
  badges: {
    display: "flex",
    gap: "8px",
    color: "#cecfd2",
    fontSize: "12px",
    flexWrap: "wrap",
  },
  badgeIcon: {
    display: "flex",
    alignItems: "center",
  },
  dueDateBadge: {
    backgroundColor: "#282e33",
    padding: "0 4px",
    borderRadius: "3px",
  },
  members: {
    display: "flex",
    gap: "-4px",
  },
  memberAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#579dff",
    border: "2px solid #22272b",
  },
};

export default CardItem;
