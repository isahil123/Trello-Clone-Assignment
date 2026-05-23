import React from "react";

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

const LabelPicker = ({ boardLabels, cardLabelIds, onToggleLabel, onClose }) => {
  return (
    <div className="card-modal-popover">
      <div className="popover-header">
        <span className="popover-title">Urgency</span>
        <button className="popover-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="popover-body">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {boardLabels.map((label) => {
            const isSelected = cardLabelIds.includes(label.id);
            const bgColor = LABEL_COLOR_MAP[label.color] || "#b3bac5";
            return (
              <div
                key={label.id}
                onClick={(e) => onToggleLabel(label.id, e)}
                className="label-color-bar"
                style={{
                  backgroundColor: bgColor,
                  padding: "6px 12px",
                  minHeight: "32px",
                  position: "relative",
                  fontWeight: "600",
                }}
              >
                <span style={{ flex: 1 }}>{label.title || ""}</span>
                {isSelected && <span style={{ marginLeft: "8px" }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LabelPicker;
