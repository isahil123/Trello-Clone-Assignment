import React, { useEffect, useRef } from "react";
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
};

const FilterMenu = ({ board, onClose }) => {
  const menuRef = useRef(null);
  const {
    searchQuery,
    setSearchQuery,
    filters,
    toggleFilterLabel,
    toggleFilterMember,
    setFilterDueDate,
    clearFilters,
  } = useBoardStore();

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [onClose]);

  return (
    <div ref={menuRef} className="filter-menu filter-menu-popover">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderBottom: "1px solid hsla(0,0%,100%,0.16)",
        }}
      >
        <div
          style={{
            flexGrow: 1,
            textAlign: "center",
            fontWeight: "600",
            color: "#9fadbc",
          }}
        >
          Filter
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#9fadbc",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          padding: "16px",
          overflowY: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Keyword Section */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Keyword
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a keyword..."
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "3px",
              border: "2px solid #579dff",
              backgroundColor: "#22272b",
              color: "#b6c2cf",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <p style={{ fontSize: "11px", color: "#9fadbc", marginTop: "4px" }}>
            Search cards, members, labels, and more.
          </p>
        </div>

        {/* Members Section */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Members
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={filters.members.includes("none")}
                onChange={() => toggleFilterMember("none")}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#579dff",
                }}
              />
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#22272b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👤
              </div>
              <span>No members</span>
            </label>
            {board?.members?.map((m) => (
              <label
                key={m.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.members.includes(m.userId)}
                  onChange={() => toggleFilterMember(m.userId)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#579dff",
                  }}
                />
                <img
                  src={
                    m.user?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${m.user?.name}&background=random`
                  }
                  alt={m.user?.name}
                  style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                />
                <span>{m.user?.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Due Date Section */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Due date
          </label>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={filters.dueDate === "noDates"}
                onChange={() => setFilterDueDate("noDates")}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#579dff",
                }}
              />
              <span style={{ color: "#9fadbc" }}>📅</span>
              <span>No dates</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={filters.dueDate === "overdue"}
                onChange={() => setFilterDueDate("overdue")}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#579dff",
                }}
              />
              <span
                style={{
                  backgroundColor: "#f87168",
                  borderRadius: "3px",
                  width: "16px",
                  height: "16px",
                  display: "inline-block",
                }}
              ></span>
              <span>Overdue</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={filters.dueDate === "complete"}
                onChange={() => setFilterDueDate("complete")}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#579dff",
                }}
              />
              <span
                style={{
                  backgroundColor: "#4bce97",
                  borderRadius: "3px",
                  width: "16px",
                  height: "16px",
                  display: "inline-block",
                }}
              ></span>
              <span>Marked as complete</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={filters.dueDate === "incomplete"}
                onChange={() => setFilterDueDate("incomplete")}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#579dff",
                }}
              />
              <span style={{ color: "#9fadbc" }}>⏱</span>
              <span>Not marked as complete</span>
            </label>
          </div>
        </div>

        {/* Labels Section */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Labels
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.entries(LABEL_COLOR_MAP).map(([colorKey, colorHex]) => (
              <button
                key={colorKey}
                onClick={() => toggleFilterLabel(colorKey)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "3px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: colorHex,
                  opacity: filters.labels.includes(colorKey) ? 1 : 0.6,
                  boxShadow: filters.labels.includes(colorKey)
                    ? "0 0 0 2px #fff inset"
                    : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
