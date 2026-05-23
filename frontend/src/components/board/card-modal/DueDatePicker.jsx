import React, { useState } from 'react';

const DueDatePicker = ({ dueDate, onSave, onRemove, onClose }) => {
  const [date, setDate] = useState(dueDate || '');
  
  return (
    <div className="card-modal-popover">
      <div className="popover-header">
        <span className="popover-title">Due date</span>
        <button className="popover-close" onClick={onClose}>✕</button>
      </div>
      <div className="popover-body">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="popover-input"
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button className="card-modal-btn save-btn" onClick={(e) => onSave(e, date)}>
            Save
          </button>
          {dueDate && (
            <button className="card-modal-btn danger-btn" onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DueDatePicker;
