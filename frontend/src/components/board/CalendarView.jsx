import React, { useState, useMemo, useRef, useEffect } from 'react';
import apiClient from '../../api/client';

const CalendarView = ({ lists, boardId, setLists }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month'); // 'Month' or 'Week'
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardListId, setNewCardListId] = useState('');
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const addMenuRef = useRef(null);
  const viewDropdownRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setShowAddMenu(false);
      }
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target)) {
        setShowViewDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ─── Month View: generate calendar days ───
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];
    // Pad with previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      result.push({ date: d, isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    // Pad rest of the grid to fill 6 rows
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      result.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
    return result;
  }, [year, month]);

  // ─── Week View: generate 7 days from Sunday of current week ───
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    const result = [];
    for (let i = 0; i < 7; i++) {
      const wd = new Date(d);
      wd.setDate(wd.getDate() + i);
      result.push({ date: wd, isCurrentMonth: true });
    }
    return result;
  }, [currentDate]);

  // Get all cards with due dates mapped by date string
  const cardsByDate = useMemo(() => {
    const map = {};
    lists.forEach(l => {
      (l.cards || []).forEach(card => {
        if (card.dueDate) {
          const key = new Date(card.dueDate).toDateString();
          if (!map[key]) map[key] = [];
          map[key].push({ ...card, listTitle: l.title });
        }
      });
    });
    return map;
  }, [lists]);

  // Navigation
  const prev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'Month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const next = () => {
    const d = new Date(currentDate);
    if (viewMode === 'Month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };
  const goToday = () => setCurrentDate(new Date());

  const isToday = (date) => date.toDateString() === today.toDateString();

  // ─── Add Card ───
  const handleAddCard = async () => {
    if (!newCardTitle.trim() || !newCardListId) return;
    try {
      setAdding(true);
      const targetList = lists.find(l => l.id === newCardListId);
      const nextPosition = targetList?.cards?.length > 0
        ? Math.max(...targetList.cards.map(c => c.position)) + 1000
        : 1000;

      const response = await apiClient.post('/cards', {
        title: newCardTitle.trim(),
        listId: newCardListId,
        position: nextPosition,
        dueDate: newCardDueDate || null,
      });
      const createdCard = response.data.data;
      setLists(prev => prev.map(l =>
        l.id === newCardListId
          ? { ...l, cards: [...l.cards, { ...createdCard, labels: [], members: [], checklists: [], comments: [] }] }
          : l
      ));
      setNewCardTitle('');
      setNewCardDueDate('');
      setShowAddCardForm(false);
    } catch (err) {
      console.error('Failed to add card:', err);
      alert('Could not add card.');
    } finally {
      setAdding(false);
    }
  };

  // ─── Add List ───
  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      setAdding(true);
      const nextPosition = lists.length > 0
        ? lists[lists.length - 1].position + 1000
        : 1000;
      const response = await apiClient.post('/lists', {
        title: newListTitle.trim(),
        boardId,
        position: nextPosition,
      });
      const createdList = response.data.data;
      setLists(prev => [...prev, { ...createdList, cards: [] }]);
      setNewListTitle('');
      setShowAddListForm(false);
    } catch (err) {
      console.error('Failed to add list:', err);
      alert('Could not add list.');
    } finally {
      setAdding(false);
    }
  };

  const activeDays = viewMode === 'Month' ? monthDays : weekDays;

  return (
    <div style={styles.container}>
      {/* ─── Top Header ─── */}
      <div style={styles.headerBar}>
        <div style={styles.headerLeft}>
          <span style={styles.monthTitle}>
            {monthNames[month]} {year} <span style={{ fontSize: '10px', opacity: 0.6 }}>⌄</span>
          </span>
          <div style={styles.navGroup}>
            <button onClick={prev} style={styles.navArrow}>‹</button>
            <button onClick={goToday} style={styles.todayBtn}>Today</button>
            <button onClick={next} style={styles.navArrow}>›</button>
          </div>
          {/* View Mode Toggle */}
          <div style={{ position: 'relative' }} ref={viewDropdownRef}>
            <button
              style={styles.viewBtn}
              onClick={() => setShowViewDropdown(!showViewDropdown)}
            >
              {viewMode} <span style={{ fontSize: '10px' }}>⌄</span>
            </button>
            {showViewDropdown && (
              <div style={styles.dropdown}>
                <button
                  style={{ ...styles.dropdownItem, ...(viewMode === 'Month' ? styles.dropdownActive : {}) }}
                  onClick={() => { setViewMode('Month'); setShowViewDropdown(false); }}
                >
                  Month
                </button>
                <button
                  style={{ ...styles.dropdownItem, ...(viewMode === 'Week' ? styles.dropdownActive : {}) }}
                  onClick={() => { setViewMode('Week'); setShowViewDropdown(false); }}
                >
                  Week
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Day Headers ─── */}
      <div style={styles.dayHeaderRow}>
        {dayNames.map(day => (
          <div key={day} style={styles.dayHeaderCell}>{day}</div>
        ))}
      </div>

      {/* ─── Calendar Grid ─── */}
      <div style={{
        ...styles.calendarGrid,
        gridTemplateRows: viewMode === 'Month' ? 'repeat(6, 1fr)' : '1fr',
      }}>
        {activeDays.map((dayObj, i) => {
          const { date, isCurrentMonth } = dayObj;
          const key = date.toDateString();
          const cards = cardsByDate[key] || [];
          const todayCell = isToday(date);

          return (
            <div
              key={i}
              style={{
                ...styles.dayCell,
                opacity: isCurrentMonth ? 1 : 0.35,
                ...(todayCell ? styles.todayCell : {}),
              }}
            >
              <div style={styles.dayCellHeader}>
                <span style={{
                  ...styles.dayCellNumber,
                  ...(todayCell ? styles.todayNumber : {}),
                }}>
                  {date.getDate() === 1 && !todayCell
                    ? `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}`
                    : date.getDate()}
                </span>
              </div>
              <div style={styles.dayCellCards}>
                {cards.map(card => (
                  <div key={card.id} style={styles.calCard} title={`${card.title} (${card.listTitle})`}>
                    {card.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Bottom Add Button ─── */}
      <div style={styles.bottomBar}>
        <div style={{ position: 'relative' }} ref={addMenuRef}>
          <button
            style={styles.addBtn}
            onClick={() => {
              setShowAddMenu(!showAddMenu);
              setShowAddCardForm(false);
              setShowAddListForm(false);
            }}
          >
            + Add
          </button>
          {showAddMenu && !showAddCardForm && !showAddListForm && (
            <div style={styles.addDropdown}>
              <button
                style={styles.addDropdownItem}
                onClick={() => {
                  setShowAddCardForm(true);
                  setShowAddMenu(false);
                  if (lists.length > 0) setNewCardListId(lists[0].id);
                  setNewCardDueDate(new Date().toISOString().split('T')[0]);
                }}
              >
                Card
              </button>
              <button
                style={styles.addDropdownItem}
                onClick={() => {
                  setShowAddListForm(true);
                  setShowAddMenu(false);
                }}
              >
                List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add Card Inline Popover (Trello-style) ─── */}
      {showAddCardForm && (
        <div style={styles.inlinePopover}>
          <div style={styles.inlinePopoverInner}>
            <div style={styles.inlineHeader}>
              <span style={styles.inlineTitle}>Add card</span>
              <button style={styles.inlineClose} onClick={() => setShowAddCardForm(false)}>✕</button>
            </div>

            <div style={styles.inlineBody}>
              <label style={styles.inlineLabel}>Name</label>
              <input
                autoFocus
                style={styles.inlineInput}
                placeholder="Enter a name for this card"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              />

              <label style={styles.inlineLabel}>List</label>
              <select
                style={styles.inlineSelect}
                value={newCardListId}
                onChange={(e) => setNewCardListId(e.target.value)}
              >
                {lists.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>

              <div style={styles.dateRow}>
                <div style={styles.dateField}>
                  <label style={styles.inlineLabel}>Start date</label>
                  <div style={styles.dateInputRow}>
                    <input type="checkbox" style={styles.dateCheckbox} disabled />
                    <input
                      type="text"
                      style={{ ...styles.dateInput, color: '#666' }}
                      placeholder="M/D/YYYY"
                      disabled
                    />
                  </div>
                </div>
                <div style={styles.dateField}>
                  <label style={styles.inlineLabel}>Due date</label>
                  <div style={styles.dateInputRow}>
                    <input
                      type="checkbox"
                      style={styles.dateCheckbox}
                      checked={!!newCardDueDate}
                      onChange={(e) => {
                        if (!e.target.checked) setNewCardDueDate('');
                        else {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setNewCardDueDate(tomorrow.toISOString().split('T')[0]);
                        }
                      }}
                    />
                    <input
                      type="date"
                      style={styles.dateInput}
                      value={newCardDueDate}
                      onChange={(e) => setNewCardDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                style={{
                  ...styles.inlineAddBtn,
                  opacity: (!newCardTitle.trim() || adding) ? 0.5 : 1,
                }}
                onClick={handleAddCard}
                disabled={adding || !newCardTitle.trim()}
              >
                {adding ? 'Adding...' : 'Add card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add List Inline Popover ─── */}
      {showAddListForm && (
        <div style={styles.inlinePopover}>
          <div style={styles.inlinePopoverInner}>
            <div style={styles.inlineHeader}>
              <span style={styles.inlineTitle}>Add list</span>
              <button style={styles.inlineClose} onClick={() => setShowAddListForm(false)}>✕</button>
            </div>
            <div style={styles.inlineBody}>
              <label style={styles.inlineLabel}>Name</label>
              <input
                autoFocus
                style={styles.inlineInput}
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              />
              <button
                style={{
                  ...styles.inlineAddBtn,
                  opacity: (!newListTitle.trim() || adding) ? 0.5 : 1,
                }}
                onClick={handleAddList}
                disabled={adding || !newListTitle.trim()}
              >
                {adding ? 'Adding...' : 'Add list'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: '#1d2125',
    color: '#b6c2cf',
    overflow: 'hidden',
  },

  /* ─── Header ─── */
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#1d2125',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  monthTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#CECFD2',
    cursor: 'pointer',
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#22272b',
    borderRadius: '3px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  navArrow: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#b6c2cf',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  todayBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    color: '#b6c2cf',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  viewBtn: {
    backgroundColor: '#22272b',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#b6c2cf',
    padding: '4px 12px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: '32px',
    left: 0,
    backgroundColor: '#282e33',
    borderRadius: '4px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    zIndex: 100,
    overflow: 'hidden',
    minWidth: '100px',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#b6c2cf',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  dropdownActive: {
    backgroundColor: '#579dff29',
    color: '#579dff',
  },

  /* ─── Day Headers ─── */
  dayHeaderRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  dayHeaderCell: {
    padding: '8px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9fadbc',
    letterSpacing: '0.5px',
    backgroundColor: '#1d2125',
  },

  /* ─── Calendar Grid ─── */
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    flexGrow: 1,
    gap: '1px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflowY: 'auto',
  },
  dayCell: {
    backgroundColor: '#22272b',
    padding: '4px 6px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '80px',
    transition: 'background-color 0.15s',
  },
  todayCell: {
    backgroundColor: '#1a2738',
  },
  dayCellHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '4px',
  },
  dayCellNumber: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#9fadbc',
    padding: '2px 4px',
  },
  todayNumber: {
    color: '#579dff',
    fontWeight: '700',
    backgroundColor: '#579dff22',
    borderRadius: '3px',
  },
  dayCellCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flexGrow: 1,
    overflowY: 'auto',
  },
  calCard: {
    backgroundColor: '#1d2125',
    borderLeft: '3px solid #579dff',
    color: '#CECFD2',
    fontSize: '11px',
    padding: '3px 6px',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
    boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
  },

  /* ─── Bottom Bar ─── */
  bottomBar: {
    padding: '8px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: '#1d2125',
    flexShrink: 0,
  },
  addBtn: {
    padding: '6px 14px',
    backgroundColor: '#22272b',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#b6c2cf',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  addDropdown: {
    position: 'absolute',
    bottom: '36px',
    left: 0,
    backgroundColor: '#282e33',
    borderRadius: '4px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    zIndex: 100,
    overflow: 'hidden',
    minWidth: '100px',
  },
  addDropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#b6c2cf',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
  },

  /* ─── Modals ─── */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
  },
  modal: {
    backgroundColor: '#282e33',
    borderRadius: '8px',
    width: '380px',
    maxWidth: '90vw',
    boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#CECFD2',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#9fadbc',
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9fadbc',
    marginBottom: '6px',
    marginTop: '12px',
  },
  formInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '3px',
    border: '2px solid #579dff',
    backgroundColor: '#22272b',
    color: '#b6c2cf',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  formSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '3px',
    border: '2px solid #579dff',
    backgroundColor: '#22272b',
    color: '#b6c2cf',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  submitBtn: {
    backgroundColor: '#579dff',
    color: '#1d2125',
    border: 'none',
    borderRadius: '3px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: '#9fadbc',
    border: 'none',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
  },

  /* ─── Inline Popovers ─── */
  inlinePopover: {
    position: 'absolute',
    bottom: '40px',
    left: '12px',
    zIndex: 1000,
  },
  inlinePopoverInner: {
    backgroundColor: '#282e33',
    borderRadius: '8px',
    width: '320px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  inlineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  inlineTitle: {
    color: '#CECFD2',
    fontSize: '14px',
    fontWeight: '600',
  },
  inlineClose: {
    background: 'none',
    border: 'none',
    color: '#9fadbc',
    fontSize: '16px',
    cursor: 'pointer',
  },
  inlineBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inlineLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9fadbc',
    marginBottom: '4px',
  },
  inlineInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '3px',
    border: '2px solid #579dff',
    backgroundColor: '#22272b',
    color: '#b6c2cf',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  inlineSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '3px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: '#22272b',
    color: '#b6c2cf',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  },
  dateRow: {
    display: 'flex',
    gap: '12px',
  },
  dateField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  dateInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#22272b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '3px',
    padding: '4px 8px',
  },
  dateCheckbox: {
    margin: 0,
    cursor: 'pointer',
  },
  dateInput: {
    background: 'transparent',
    border: 'none',
    color: '#b6c2cf',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  inlineAddBtn: {
    marginTop: '8px',
    backgroundColor: '#579dff',
    color: '#1d2125',
    border: 'none',
    borderRadius: '3px',
    padding: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    width: 'fit-content',
  },
};

export default CalendarView;
