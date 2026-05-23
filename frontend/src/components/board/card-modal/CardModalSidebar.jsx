import React, { useState } from "react";
import DueDatePicker from "./DueDatePicker";
import LabelPicker from "./LabelPicker";

// Color cover feature removed for final deliverable

const CardModalSidebar = ({
  card,
  boardLabels,
  boardMembers,
  onLocalChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);
  const [showMembersPopover, setShowMembersPopover] = useState(false);

  const handleSaveDueDate = async (e, dateString) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onLocalChange?.({
      dueDate: dateString ? new Date(dateString).toISOString() : null,
    });
    setShowDatePicker(false);
  };

  const handleRemoveDueDate = async () => {
    onLocalChange?.({ dueDate: null, isCompleted: false });
    setShowDatePicker(false);
  };

  const handleToggleCompleted = async () => {
    onLocalChange?.({ isCompleted: !card.isCompleted });
  };

  const handleToggleLabel = async (labelId, e) => {
    if (e) e.stopPropagation();
    const currentIds = (card.labels || []).map((l) => l.labelId);
    const hasLabel = currentIds.includes(labelId);
    let nextIds = hasLabel
      ? currentIds.filter((id) => id !== labelId)
      : [...currentIds, labelId];

    const selectedLabel = boardLabels.find((l) => l.id === labelId);
    const title = (selectedLabel?.title || "").toLowerCase();
    const conflictingTitle =
      title === "urgent"
        ? "not urgent"
        : title === "not urgent"
          ? "urgent"
          : null;
    if (conflictingTitle) {
      const conflictingLabel = boardLabels.find(
        (l) => (l.title || "").toLowerCase() === conflictingTitle,
      );
      if (conflictingLabel) {
        nextIds = nextIds.filter((id) => id !== conflictingLabel.id);
      }
    }

    onLocalChange?.({ labels: nextIds });
    setShowLabelsPopover(false);
  };

  const handleToggleMember = async (userId) => {
    const currentIds = (card.members || []).map((m) => m.userId || m.id);
    const nextIds = currentIds.includes(userId)
      ? currentIds.filter((id) => id !== userId)
      : [...currentIds, userId];
    onLocalChange?.({ members: nextIds });
  };

  // cover/color functionality removed to simplify UI

  return (
    <div className="card-modal-sidebar">
      <h3>Add to card</h3>

      <div className="sidebar-btn-container" style={{ position: "relative" }}>
        <button
          className="card-modal-btn side-btn"
          onClick={() => setShowLabelsPopover(!showLabelsPopover)}
        >
          <span className="sidebar-icon">🏷️</span> Urgency
        </button>
        {showLabelsPopover && (
          <LabelPicker
            boardLabels={boardLabels}
            cardLabelIds={(card.labels || []).map((l) => l.labelId)}
            onToggleLabel={handleToggleLabel}
            onClose={() => setShowLabelsPopover(false)}
          />
        )}
      </div>

      <div className="sidebar-btn-container" style={{ position: "relative" }}>
        <button
          className="card-modal-btn side-btn"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <span className="sidebar-icon">🕒</span> Date
        </button>
        {showDatePicker && (
          <DueDatePicker
            dueDate={card.dueDate ? card.dueDate.slice(0, 10) : ""}
            onSave={handleSaveDueDate}
            onRemove={handleRemoveDueDate}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </div>

      {/* Color controls removed to focus on core features */}

      {card.dueDate && (
        <div className="sidebar-meta-section" style={{ marginTop: "24px" }}>
          <h3
            style={{ fontSize: "12px", color: "#9fadbc", marginBottom: "8px" }}
          >
            Due Date
          </h3>
          <div
            className="due-date-display"
            onClick={handleToggleCompleted}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#22272b",
              padding: "6px 12px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={card.isCompleted}
              onChange={handleToggleCompleted}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: "pointer" }}
            />
            <span
              style={{
                textDecoration: card.isCompleted ? "line-through" : "none",
                color: card.isCompleted
                  ? "#1f845a"
                  : new Date(card.dueDate) < new Date()
                    ? "#f87168"
                    : "#b6c2cf",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardModalSidebar;
