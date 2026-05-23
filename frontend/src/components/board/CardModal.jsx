import React, { useState, useEffect } from "react";
import apiClient from "../../api/client";
import DueDatePicker from "./card-modal/DueDatePicker";
import LabelPicker from "./card-modal/LabelPicker";
import ChecklistManager from "./card-modal/ChecklistManager";
import { useBoard } from "../../context/BoardContext";
import "./card-modal/CardModal.css";

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

const CardModal = ({ card, listTitle, boardId, onClose }) => {
  const { handleCardUpdate: onUpdate } = useBoard();

  // ---- Local state ----
  const [description, setDescription] = useState(card.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  // Checklists
  const [checklists, setChecklists] = useState(card.checklists || []);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("Checklist");
  const [newItemInputs, setNewItemInputs] = useState({}); // { [checklistId]: string }

  // Labels
  const [boardLabels, setBoardLabels] = useState([]);
  const [cardLabelIds, setCardLabelIds] = useState(
    (card.labels || []).map((cl) => cl.label?.id || cl.labelId),
  );
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);

  // Members
  const [boardMembers, setBoardMembers] = useState([]);
  const [cardMemberIds, setCardMemberIds] = useState(
    (card.members || []).map((cm) => cm.user?.id || cm.userId),
  );
  const [showMembersPopover, setShowMembersPopover] = useState(false);

  // Due date
  const [dueDate, setDueDate] = useState(
    card.dueDate ? card.dueDate.slice(0, 10) : "",
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Comments
  const [comments, setComments] = useState(card.comments || []);
  const [newComment, setNewComment] = useState("");

  // Fetch board labels and members on mount
  useEffect(() => {
    if (!boardId) return;
    apiClient
      .get(`/boards/${boardId}`)
      .then((res) => {
        const data = res.data.data;
        setBoardLabels(data.labels || []);
        setBoardMembers((data.members || []).map((m) => m.user));
      })
      .catch(console.error);
  }, [boardId]);

  const stopPropagation = (e) => e.stopPropagation();

  const syncParentCard = (updates = {}) => {
    onUpdate({
      ...card,
      ...updates,
      labels: Object.prototype.hasOwnProperty.call(updates, "labels")
        ? updates.labels
        : card.labels || [],
      members: Object.prototype.hasOwnProperty.call(updates, "members")
        ? updates.members
        : card.members || [],
      checklists: Object.prototype.hasOwnProperty.call(updates, "checklists")
        ? updates.checklists
        : checklists,
      comments: Object.prototype.hasOwnProperty.call(updates, "comments")
        ? updates.comments
        : comments,
    });
  };

  // ---- Title ----
  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle.trim() === card.title) {
      setIsEditingTitle(false);
      setEditTitle(card.title);
      return;
    }
    try {
      const res = await apiClient.patch(`/cards/${card.id}`, {
        title: editTitle.trim(),
      });
      syncParentCard({ ...res.data.data });
      setIsEditingTitle(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Description ----
  const handleSaveDescription = async () => {
    try {
      const res = await apiClient.patch(`/cards/${card.id}`, { description });
      syncParentCard({ ...res.data.data });
      setIsEditingDesc(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save description.");
    }
  };

  // ---- Due Date ----
  const handleSaveDueDate = async () => {
    try {
      const res = await apiClient.patch(`/cards/${card.id}`, {
        dueDate: dueDate || null,
      });
      syncParentCard({ ...res.data.data });
      setShowDatePicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveDueDate = async () => {
    try {
      const res = await apiClient.patch(`/cards/${card.id}`, { dueDate: null });
      setDueDate("");
      syncParentCard({ ...res.data.data });
      setShowDatePicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Labels ----
  const handleToggleLabel = async (labelId) => {
    const isAttached = cardLabelIds.includes(labelId);
    try {
      if (isAttached) {
        await apiClient.delete(`/cards/${card.id}/labels/${labelId}`);
        const nextLabelIds = cardLabelIds.filter((id) => id !== labelId);
        const nextLabels = nextLabelIds.map((id) => ({
          id,
          labelId: id,
          label: boardLabels.find((label) => label.id === id) || null,
        }));
        setCardLabelIds(nextLabelIds);
        syncParentCard({ labels: nextLabels });
      } else {
        await apiClient.post(`/cards/${card.id}/labels`, { labelId });
        const nextLabelIds = [...cardLabelIds, labelId];
        const nextLabels = nextLabelIds.map((id) => ({
          id,
          labelId: id,
          label: boardLabels.find((label) => label.id === id) || null,
        }));
        setCardLabelIds(nextLabelIds);
        syncParentCard({ labels: nextLabels });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Members ----
  const handleToggleMember = async (userId) => {
    const isAssigned = cardMemberIds.includes(userId);
    try {
      if (isAssigned) {
        await apiClient.delete(`/cards/${card.id}/members/${userId}`);
        const nextMemberIds = cardMemberIds.filter((id) => id !== userId);
        const nextMembers = nextMemberIds.map((id) => ({
          id,
          userId: id,
          user: boardMembers.find((user) => user.id === id) || null,
        }));
        setCardMemberIds(nextMemberIds);
        syncParentCard({ members: nextMembers });
      } else {
        await apiClient.post(`/cards/${card.id}/members`, { userId });
        const nextMemberIds = [...cardMemberIds, userId];
        const nextMembers = nextMemberIds.map((id) => ({
          id,
          userId: id,
          user: boardMembers.find((user) => user.id === id) || null,
        }));
        setCardMemberIds(nextMemberIds);
        syncParentCard({ members: nextMembers });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Checklists ----
  const handleAddChecklist = async () => {
    try {
      const res = await apiClient.post("/checklists", {
        title: newChecklistTitle.trim() || "Checklist",
        cardId: card.id,
      });
      const nextChecklists = [...checklists, { ...res.data.data, items: [] }];
      setChecklists(nextChecklists);
      syncParentCard({ checklists: nextChecklists });
      setNewChecklistTitle("Checklist");
      setShowAddChecklist(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      await apiClient.delete(`/checklists/${checklistId}`);
      const nextChecklists = checklists.filter((c) => c.id !== checklistId);
      setChecklists(nextChecklists);
      syncParentCard({ checklists: nextChecklists });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (checklistId) => {
    const title = (newItemInputs[checklistId] || "").trim();
    if (!title) return;
    const checklist = checklists.find((c) => c.id === checklistId);
    const nextPos =
      checklist.items.length > 0
        ? checklist.items[checklist.items.length - 1].position + 1000
        : 1000;
    try {
      const res = await apiClient.post("/checklists/items", {
        title,
        checklistId,
        position: nextPos,
      });
      const nextChecklists = checklists.map((c) =>
        c.id === checklistId ? { ...c, items: [...c.items, res.data.data] } : c,
      );
      setChecklists(nextChecklists);
      syncParentCard({ checklists: nextChecklists });
      setNewItemInputs((prev) => ({ ...prev, [checklistId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleItem = async (checklistId, itemId, isCompleted) => {
    try {
      await apiClient.patch(`/checklists/items/${itemId}`, {
        isCompleted: !isCompleted,
      });
      const nextChecklists = checklists.map((c) =>
        c.id === checklistId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, isCompleted: !isCompleted } : i,
              ),
            }
          : c,
      );
      setChecklists(nextChecklists);
      syncParentCard({ checklists: nextChecklists });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (checklistId, itemId) => {
    try {
      await apiClient.delete(`/checklists/items/${itemId}`);
      const nextChecklists = checklists.map((c) =>
        c.id === checklistId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c,
      );
      setChecklists(nextChecklists);
      syncParentCard({ checklists: nextChecklists });
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Comments ----
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      // Use first board member as the commenter (mock auth)
      const userId = boardMembers.length > 0 ? boardMembers[0].id : null;
      if (!userId) return alert("No users available to comment.");
      const res = await apiClient.post(`/cards/${card.id}/comments`, {
        text: newComment.trim(),
        userId,
      });
      const nextComments = [res.data.data, ...comments];
      setComments(nextComments);
      syncParentCard({ comments: nextComments });
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Helpers ----
  const getChecklistProgress = (checklist) => {
    if (!checklist.items || checklist.items.length === 0) return 0;
    const done = checklist.items.filter((i) => i.isCompleted).length;
    return Math.round((done / checklist.items.length) * 100);
  };

  // TODO: Implement real-time websockets here later so users don't have to refresh for new comments

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div
        className="card-modal"
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="card-modal-header">
          <div className="header-icon">📋</div>
          <div className="header-content">
            {isEditingTitle ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className="header-title-input"
              />
            ) : (
              <h2 className="header-title" onClick={() => setIsEditingTitle(true)}>
                {card.title}
              </h2>
            )}
            <p className="header-subtitle">
              in list <span className="subtitle-link">{listTitle}</span>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Info chips (labels and due date badges) */}
        <div className="chip-row">
          {cardLabelIds.length > 0 && (
            <div className="chip-group">
              <span className="chip-label">Labels</span>
              <div className="chip-list">
                {boardLabels
                  .filter((l) => cardLabelIds.includes(l.id))
                  .map((label) => (
                    <span
                      key={label.id}
                      className="label-chip"
                      style={{
                        backgroundColor:
                          LABEL_COLOR_MAP[label.color] || "#b3bac5",
                      }}
                    >
                      {label.title || ""}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {dueDate && (
            <div className="chip-group">
              <span className="chip-label">Due date</span>
              <span className="due-date-chip">
                📅{" "}
                {new Date(dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="card-modal-body">
          {/* Main column */}
          <div className="main-column">
            {/* Description */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>≡</span>
                <h3 style={styles.sectionTitle}>Description</h3>
                {!isEditingDesc && card.description && (
                  <button
                    style={styles.editButton}
                    onClick={() => setIsEditingDesc(true)}
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingDesc ? (
                <div style={styles.editorBlock}>
                  <textarea
                    autoFocus
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                    placeholder="Add a more detailed description..."
                    rows={4}
                  />
                  <div style={styles.editorActions}>
                    <button
                      style={styles.saveButton}
                      onClick={handleSaveDescription}
                    >
                      Save
                    </button>
                    <button
                      style={styles.cancelTextButton}
                      onClick={() => {
                        setDescription(card.description || "");
                        setIsEditingDesc(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={
                    card.description
                      ? styles.descContent
                      : styles.descPlaceholder
                  }
                  onClick={() => setIsEditingDesc(true)}
                >
                  {card.description || "Add a more detailed description..."}
                </div>
              )}
            </div>

            {/* Checklists */}
            <ChecklistManager
              checklists={checklists}
              handleDeleteChecklist={handleDeleteChecklist}
              handleToggleItem={handleToggleItem}
              handleDeleteItem={handleDeleteItem}
              handleAddItem={handleAddItem}
            />

            {/* Activity / Comments */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>💬</span>
                <h3 style={styles.sectionTitle}>Activity</h3>
              </div>

              <div style={styles.commentInputRow}>
                <div style={styles.commentAvatar}>S</div>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment();
                  }}
                  style={styles.commentInput}
                />
                {newComment.trim() && (
                  <button style={styles.saveButton} onClick={handleAddComment}>
                    Save
                  </button>
                )}
              </div>

              <div style={styles.commentList}>
                {comments.map((comment) => (
                  <div key={comment.id} style={styles.commentItem}>
                    <div style={styles.commentAvatar}>
                      {(comment.user?.name || "U")[0]}
                    </div>
                    <div style={styles.commentBody}>
                      <div style={styles.commentMeta}>
                        <strong style={styles.commentAuthor}>
                          {comment.user?.name || "Unknown"}
                        </strong>
                        <span style={styles.commentTime}>
                          {new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <p style={styles.commentText}>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="card-modal-side" style={styles.sideColumn}>
            <h4 style={styles.sideTitle}>Add to card</h4>

            {/* Members button */}
            <div style={{ position: "relative" }}>
              <button
                style={styles.sideButton}
                onClick={() => {
                  setShowMembersPopover(!showMembersPopover);
                  setShowLabelsPopover(false);
                  setShowDatePicker(false);
                }}
              >
                👤 Members
              </button>
              {showMembersPopover && (
                <div style={styles.popover}>
                  <div style={styles.popoverHeader}>
                    <span style={styles.popoverTitle}>Members</span>
                    <button
                      style={styles.popoverClose}
                      onClick={() => setShowMembersPopover(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={styles.popoverBody}>
                    {boardMembers.map((user) => (
                      <div
                        key={user.id}
                        style={styles.popoverItem}
                        onClick={() => handleToggleMember(user.id)}
                      >
                        <div style={styles.popoverAvatar}>{user.name[0]}</div>
                        <span>{user.name}</span>
                        {cardMemberIds.includes(user.id) && (
                          <span style={styles.checkMark}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <LabelPicker 
              showLabelsPopover={showLabelsPopover}
              setShowLabelsPopover={setShowLabelsPopover}
              setShowMembersPopover={setShowMembersPopover}
              setShowDatePicker={setShowDatePicker}
              boardLabels={boardLabels}
              cardLabelIds={cardLabelIds}
              handleToggleLabel={handleToggleLabel}
            />

            {/* Checklist button */}
            <div style={{ position: "relative" }}>
              <button
                style={styles.sideButton}
                onClick={() => {
                  setShowAddChecklist(!showAddChecklist);
                  setShowLabelsPopover(false);
                  setShowMembersPopover(false);
                  setShowDatePicker(false);
                }}
              >
                ☑️ Checklist
              </button>
              {showAddChecklist && (
                <div style={styles.popover}>
                  <div style={styles.popoverHeader}>
                    <span style={styles.popoverTitle}>Add checklist</span>
                    <button
                      style={styles.popoverClose}
                      onClick={() => setShowAddChecklist(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={styles.popoverBody}>
                    <label style={styles.popoverLabel}>Title</label>
                    <input
                      autoFocus
                      type="text"
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddChecklist()
                      }
                      style={styles.popoverInput}
                    />
                    <button
                      style={styles.saveButton}
                      onClick={handleAddChecklist}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <DueDatePicker 
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              dueDate={dueDate}
              setDueDate={setDueDate}
              handleSaveDueDate={handleSaveDueDate}
              handleRemoveDueDate={handleRemoveDueDate}
              setShowLabelsPopover={setShowLabelsPopover}
              setShowMembersPopover={setShowMembersPopover}
              setShowAddChecklist={setShowAddChecklist}
            />

            <div style={styles.sideDivider} />
            <h4 style={styles.sideTitle}>Actions</h4>
            <button
              style={styles.sideButton}
              onClick={async () => {
                if (
                  window.confirm("Are you sure you want to delete this card?")
                ) {
                  try {
                    await apiClient.delete(`/cards/${card.id}`);
                    onUpdate({ ...card, _deleted: true });
                    onClose();
                  } catch (err) {
                    console.error("Failed to delete card", err);
                  }
                }
              }}
            >
              📥 Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.64)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 1000,
    overflowY: "auto",
    paddingTop: "48px",
    paddingBottom: "80px",
  },
  modal: {
    backgroundColor: "#323940",
    width: "768px",
    maxWidth: "95vw",
    borderRadius: "12px",
    color: "#b6c2cf",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    display: "flex",
    padding: "16px 20px 8px 20px",
    gap: "12px",
  },
  headerIcon: {
    fontSize: "20px",
    paddingTop: "4px",
  },
  headerContent: {
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    margin: "0 0 2px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#CECFD2",
    cursor: "pointer",
  },
  titleInput: {
    width: "100%",
    fontSize: "20px",
    fontWeight: "600",
    color: "#CECFD2",
    backgroundColor: "#22272b",
    border: "2px solid #579dff",
    borderRadius: "3px",
    padding: "4px 8px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#9fadbc",
  },
  subtitleLink: {
    textDecoration: "underline",
    cursor: "pointer",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#9fadbc",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px 8px",
    height: "fit-content",
    borderRadius: "8px",
    lineHeight: 1,
  },
  chipRow: {
    display: "flex",
    gap: "24px",
    padding: "8px 20px 8px 52px",
    flexWrap: "wrap",
  },
  chipGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  chipLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9fadbc",
  },
  chipList: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
  },
  labelChip: {
    padding: "4px 12px",
    borderRadius: "3px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#1d2125",
    minWidth: "48px",
    textAlign: "center",
  },
  dueDateChip: {
    backgroundColor: "#22272b",
    padding: "4px 12px",
    borderRadius: "3px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#b6c2cf",
  },
  body: {
    display: "flex",
    padding: "12px 20px 24px 20px",
    gap: "16px",
  },
  mainColumn: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sideColumn: {
    width: "168px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sectionIcon: {
    fontSize: "18px",
    width: "24px",
    textAlign: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    flexGrow: 1,
    color: "#CECFD2",
  },
  editButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#b6c2cf",
    padding: "6px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  editorBlock: {
    marginLeft: "36px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  textarea: {
    width: "100%",
    backgroundColor: "#22272b",
    border: "1px solid #738496",
    borderRadius: "3px",
    padding: "8px 12px",
    color: "#b6c2cf",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  editorActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#579dff",
    color: "#1d2125",
    border: "none",
    padding: "6px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  cancelTextButton: {
    background: "none",
    border: "none",
    color: "#9fadbc",
    cursor: "pointer",
    fontSize: "14px",
  },
  dangerButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#f87168",
    border: "none",
    padding: "6px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  descContent: {
    marginLeft: "36px",
    cursor: "pointer",
    whiteSpace: "pre-wrap",
    fontSize: "14px",
    lineHeight: "20px",
  },
  descPlaceholder: {
    marginLeft: "36px",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "3px",
    cursor: "pointer",
    minHeight: "40px",
    color: "#9fadbc",
    fontSize: "14px",
  },
  // Progress bar
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "36px",
  },
  progressText: {
    fontSize: "11px",
    color: "#9fadbc",
    width: "32px",
    textAlign: "right",
  },
  progressBar: {
    flexGrow: 1,
    height: "8px",
    borderRadius: "4px",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease, background-color 0.3s ease",
  },
  // Checklist items
  checklistItems: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    marginLeft: "36px",
  },
  checklistItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 8px",
    borderRadius: "8px",
    transition: "background-color 0.1s",
  },
  checkbox: {
    accentColor: "#579dff",
    cursor: "pointer",
    width: "16px",
    height: "16px",
    flexShrink: 0,
  },
  itemTitle: {
    flexGrow: 1,
    fontSize: "14px",
  },
  itemDeleteButton: {
    background: "none",
    border: "none",
    color: "#9fadbc60",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 6px",
    borderRadius: "3px",
    opacity: 0.6,
  },
  addItemRow: {
    display: "flex",
    gap: "8px",
    marginLeft: "36px",
    marginTop: "4px",
  },
  addItemInput: {
    flexGrow: 1,
    backgroundColor: "#22272b",
    border: "1px solid #738496",
    borderRadius: "3px",
    padding: "6px 10px",
    color: "#b6c2cf",
    outline: "none",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  addItemButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#b6c2cf",
    padding: "6px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  // Comments
  commentInputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginLeft: "36px",
  },
  commentAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff78cb, #c377e0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    flexShrink: 0,
  },
  commentInput: {
    flexGrow: 1,
    backgroundColor: "#22272b",
    border: "1px solid #738496",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#b6c2cf",
    outline: "none",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginLeft: "36px",
    marginTop: "8px",
  },
  commentItem: {
    display: "flex",
    gap: "8px",
  },
  commentBody: {
    flexGrow: 1,
    minWidth: 0,
  },
  commentMeta: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "2px",
  },
  commentAuthor: {
    fontSize: "14px",
    color: "#CECFD2",
  },
  commentTime: {
    fontSize: "12px",
    color: "#9fadbc",
  },
  commentText: {
    margin: 0,
    backgroundColor: "#22272b",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "20px",
    wordBreak: "break-word",
  },
  // Side column
  sideTitle: {
    margin: "4px 0",
    fontSize: "12px",
    fontWeight: "600",
    color: "#9fadbc",
  },
  sideButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#b6c2cf",
    padding: "6px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: "500",
    textAlign: "left",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    transition: "background-color 0.1s",
  },
  sideDivider: {
    height: "1px",
    backgroundColor: "hsla(0, 0%, 100%, 0.16)",
    margin: "8px 0",
  },
  // Popovers
  popover: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "4px",
    backgroundColor: "#282e33",
    borderRadius: "8px",
    width: "280px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    zIndex: 10,
    overflow: "hidden",
  },
  popoverHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: "1px solid hsla(0, 0%, 100%, 0.16)",
  },
  popoverTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#b6c2cf",
    flexGrow: 1,
    textAlign: "center",
  },
  popoverClose: {
    background: "none",
    border: "none",
    color: "#9fadbc",
    cursor: "pointer",
    fontSize: "16px",
    padding: "2px",
  },
  popoverBody: {
    padding: "8px 12px 12px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  popoverLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9fadbc",
    marginBottom: "4px",
  },
  popoverInput: {
    backgroundColor: "#22272b",
    border: "1px solid #738496",
    borderRadius: "3px",
    padding: "6px 10px",
    color: "#b6c2cf",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  popoverItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 8px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.1s",
  },
  popoverAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #579dff, #0c66e4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    flexShrink: 0,
  },
  checkMark: {
    marginLeft: "auto",
    color: "#579dff",
    fontWeight: "600",
  },
  labelOption: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
    cursor: "pointer",
  },
  labelColorBar: {
    flexGrow: 1,
    padding: "6px 12px",
    borderRadius: "3px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1d2125",
    minHeight: "20px",
  },
};

export default CardModal;
