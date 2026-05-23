import React, { useState } from "react";

const CardModalHeader = ({ card, onLocalChange, onArchive }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle.trim() === card.title) {
      setIsEditingTitle(false);
      setEditTitle(card.title);
      return;
    }
    onLocalChange?.({ title: editTitle.trim() });
    setIsEditingTitle(false);
  };

  return (
    <div className="card-modal-header">
      <div className="header-title-row">
        <span className="card-modal-icon">◫</span>
        {isEditingTitle ? (
          <textarea
            autoFocus
            className="card-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveTitle();
              }
              if (e.key === "Escape") {
                setIsEditingTitle(false);
                setEditTitle(card.title);
              }
            }}
          />
        ) : (
          <h2
            className="card-title-display"
            onClick={() => setIsEditingTitle(true)}
          >
            {card.title}
          </h2>
        )}
      </div>

      <div className="header-actions">
        {card.isArchived && <span className="archived-badge">Archived</span>}
        <div className="header-buttons" style={{ display: "flex", gap: "8px" }}>
          <button className="card-modal-btn danger-btn" onClick={onArchive}>
            {card.isArchived ? "Unarchive" : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModalHeader;
