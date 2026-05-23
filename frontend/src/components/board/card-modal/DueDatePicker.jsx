import React from 'react';

const DueDatePicker = ({
  showDatePicker,
  setShowDatePicker,
  dueDate,
  setDueDate,
  handleSaveDueDate,
  handleRemoveDueDate,
  setShowLabelsPopover,
  setShowMembersPopover,
  setShowAddChecklist
}) => {
  return (
    <div style={{ position: "relative" }}>
      <button
        className="card-modal-btn side-btn"
        onClick={() => {
          setShowDatePicker(!showDatePicker);
          setShowLabelsPopover(false);
          setShowMembersPopover(false);
          setShowAddChecklist(false);
        }}
      >
        📅 Dates
      </button>
      {showDatePicker && (
        <div className="card-modal-popover">
          <div className="popover-header">
            <span className="popover-title">Due date</span>
            <button
              className="popover-close"
              onClick={() => setShowDatePicker(false)}
            >
              ✕
            </button>
          </div>
          <div className="popover-body">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="popover-input"
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                className="card-modal-btn save-btn"
                onClick={handleSaveDueDate}
              >
                Save
              </button>
              {dueDate && (
                <button
                  className="card-modal-btn danger-btn"
                  onClick={handleRemoveDueDate}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueDatePicker;
