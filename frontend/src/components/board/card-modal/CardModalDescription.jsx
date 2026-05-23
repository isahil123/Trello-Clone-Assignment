import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CardModalDescription = ({ card, boardLabels = [], onLocalChange }) => {
  // Local editable state
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(card?.description || "");
  const [dueDate, setDueDate] = useState(
    card?.dueDate ? card.dueDate.slice(0, 10) : "",
  );
  const [selectedLabelIds, setSelectedLabelIds] = useState(
    (card?.labels || []).map((l) => l.labelId),
  );

  useEffect(() => {
    setDescription(card?.description || "");
    setDueDate(card?.dueDate ? card.dueDate.slice(0, 10) : "");
    setSelectedLabelIds((card?.labels || []).map((l) => l.labelId));
  }, [card?.id]);

  const handleSaveDescription = async () => {
    onLocalChange?.({ description });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDescription(card?.description || "");
    setDueDate(card?.dueDate ? card.dueDate.slice(0, 10) : "");
    setSelectedLabelIds((card?.labels || []).map((l) => l.labelId));
    setIsEditing(false);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleSaveDueDate = async () => {
    const iso = dueDate ? new Date(dueDate).toISOString() : null;
    onLocalChange?.({ dueDate: iso });
  };

  const handleToggleCompleted = () => {
    onLocalChange?.({ isCompleted: !card?.isCompleted });
  };

  const toggleLabel = async (labelId) => {
    const has = selectedLabelIds.includes(labelId);
    // optimistic UI
    setSelectedLabelIds((prev) =>
      has ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    );
  };

  const handleSaveLabels = () => {
    onLocalChange?.({ labels: selectedLabelIds });
  };

  return (
    <div className="card-modal-section description-section">
      <div className="section-header">
        <span className="card-modal-icon">≡</span>
        <h3>Details</h3>
        {!isEditing &&
          (description || dueDate || (selectedLabelIds || []).length > 0) && (
            <button
              className="card-modal-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
      </div>

      <div className="section-content">
        {isEditing ? (
          <div className="description-editor">
            <textarea
              autoFocus
              className="description-input"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => {
                const next = e.target.value;
                setDescription(next);
                onLocalChange?.({ description: next });
              }}
            />

            <div style={{ marginTop: 12 }}>
              <label
                style={{ display: "block", fontSize: 12, color: "#9fadbc" }}
              >
                Due date
              </label>
              <input
                type="date"
                className="due-date-input"
                value={dueDate}
                onChange={handleDueDateChange}
              />
              <button
                className="card-modal-btn save-date-btn"
                type="button"
                style={{ marginLeft: 8 }}
                onClick={handleSaveDueDate}
              >
                Save date
              </button>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 10,
                  color: "#b6c2cf",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!card?.isCompleted}
                  onChange={handleToggleCompleted}
                />
                Mark as complete
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#9fadbc",
                  marginBottom: 6,
                }}
              >
                Labels
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(boardLabels || []).map((lb) => {
                  const isSelected = selectedLabelIds.includes(lb.id);
                  const color =
                    (lb.color && lb.color.toLowerCase()) || "#b3bac5";
                  return (
                    <button
                      key={lb.id}
                      onClick={() => toggleLabel(lb.id)}
                      style={{
                        width: 36,
                        height: 20,
                        borderRadius: 4,
                        border: isSelected
                          ? "2px solid #fff"
                          : "1px solid transparent",
                        backgroundColor: color,
                        cursor: "pointer",
                      }}
                      aria-pressed={isSelected}
                      title={lb.title}
                    />
                  );
                })}
              </div>
            </div>

            <div className="description-actions" style={{ marginTop: 12 }}>
              <button
                className="primary-btn"
                type="button"
                onClick={handleSaveLabels}
              >
                Save labels
              </button>
              <button
                className="primary-btn"
                type="button"
                onClick={handleSaveDescription}
              >
                Save
              </button>
              <button
                className="cancel-btn"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`description-display ${!description ? "empty" : ""}`}
            onClick={() => setIsEditing(true)}
          >
            {description ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            ) : (
              <div style={{ color: "#9fadbc" }}>
                Add a more detailed description...
              </div>
            )}

            {/* display due date and labels */}
            <div style={{ marginTop: 8 }}>
              {dueDate && (
                <div style={{ fontSize: 13, color: "#b6c2cf" }}>
                  Due: {new Date(dueDate).toLocaleDateString()}
                </div>
              )}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                  color: "#b6c2cf",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!card?.isCompleted}
                  onChange={handleToggleCompleted}
                />
                Mark as complete
              </label>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {(boardLabels || [])
                  .filter((lb) => selectedLabelIds.includes(lb.id))
                  .map((lb) => (
                    <div
                      key={lb.id}
                      style={{
                        width: 40,
                        height: 10,
                        backgroundColor: lb.color || "#b3bac5",
                        borderRadius: 4,
                      }}
                      title={lb.title}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardModalDescription;
