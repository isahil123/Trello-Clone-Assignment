import React from 'react';

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

const LabelPicker = ({
  showLabelsPopover,
  setShowLabelsPopover,
  setShowMembersPopover,
  setShowDatePicker,
  boardLabels,
  cardLabelIds,
  handleToggleLabel
}) => {
  return (
    <div style={{ position: "relative" }}>
      <button
        className="card-modal-btn side-btn"
        onClick={() => {
          setShowLabelsPopover(!showLabelsPopover);
          setShowMembersPopover(false);
          setShowDatePicker(false);
        }}
      >
        🏷️ Labels
      </button>
      {showLabelsPopover && (
        <div className="card-modal-popover">
          <div className="popover-header">
            <span className="popover-title">Labels</span>
            <button
              className="popover-close"
              onClick={() => setShowLabelsPopover(false)}
            >
              ✕
            </button>
          </div>
          <div className="popover-body">
            {boardLabels.map((label) => (
              <div
                key={label.id}
                className="label-option"
                onClick={() => handleToggleLabel(label.id)}
              >
                <div
                  className="label-color-bar"
                  style={{
                    backgroundColor:
                      LABEL_COLOR_MAP[label.color] || "#b3bac5",
                  }}
                >
                  {label.title || ""}
                </div>
                {cardLabelIds.includes(label.id) && (
                  <span className="check-mark">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelPicker;
