import React, { useState } from "react";

const ChecklistManager = ({
  checklists,
  handleDeleteChecklist,
  handleToggleItem,
  handleDeleteItem,
  handleAddItem,
}) => {
  const [newItemInputs, setNewItemInputs] = useState({});

  const getChecklistProgress = (checklist) => {
    if (!checklist.items || checklist.items.length === 0) return 0;
    const done = checklist.items.filter((i) => i.isCompleted).length;
    return Math.round((done / checklist.items.length) * 100);
  };

  return (
    <>
      {checklists.map((checklist) => {
        const progress = getChecklistProgress(checklist);
        return (
          <div key={checklist.id} className="card-modal-section">
            <div className="section-header">
              <span className="section-icon">☑</span>
              <h3 className="section-title">{checklist.title}</h3>
              <button
                className="card-modal-btn edit-btn"
                onClick={() => handleDeleteChecklist(checklist.id)}
              >
                Delete
              </button>
            </div>

            <div className="progress-row">
              <span className="progress-text">{progress}%</span>
              <div className="progress-bar-bg">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? "#4bce97" : "#579dff",
                  }}
                />
              </div>
            </div>

            <div className="checklist-items">
              {checklist.items.map((item) => (
                <div key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() =>
                      handleToggleItem(checklist.id, item.id, item.isCompleted)
                    }
                    className="checklist-checkbox"
                  />
                  <span
                    className={`item-title ${item.isCompleted ? "completed" : ""}`}
                  >
                    {item.title}
                  </span>
                  <button
                    className="item-delete-btn"
                    onClick={() => handleDeleteItem(checklist.id, item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="add-item-row">
              <input
                type="text"
                placeholder="Add an item..."
                value={newItemInputs[checklist.id] || ""}
                onChange={(e) =>
                  setNewItemInputs((prev) => ({
                    ...prev,
                    [checklist.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem(
                      checklist.id,
                      newItemInputs[checklist.id] || "",
                    );
                    setNewItemInputs((prev) => ({
                      ...prev,
                      [checklist.id]: "",
                    }));
                  }
                }}
                className="add-item-input"
              />
              <button
                className="card-modal-btn add-btn"
                onClick={() => {
                  handleAddItem(
                    checklist.id,
                    newItemInputs[checklist.id] || "",
                  );
                  setNewItemInputs((prev) => ({ ...prev, [checklist.id]: "" }));
                }}
              >
                Add
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChecklistManager;
