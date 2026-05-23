import React, { useState, useMemo, useRef, useEffect } from 'react';
import apiClient from '../../api/client';

const TimelineView = ({ lists, boardId, setLists }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardListId, setNewCardListId] = useState('');
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const addMenuRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Generate 14 days starting from 3 days ago so "today" is visible
  const days = useMemo(() => {
    const result = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 3);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [currentDate]);

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const prev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const next = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
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

  return (
    <div style={styles.container}>
      {/* ─── Header ─── */}
      <div style={styles.headerBar}>
        <div style={styles.headerLeft}>
          <span style={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} <span style={{ fontSize: '10px', opacity: 0.6 }}>⌄</span>
          </span>
          <div style={styles.navGroup}>
            <button onClick={prev} style={styles.navArrow}>‹</button>
            <button onClick={goToday} style={styles.todayBtn}>Today</button>
            <button onClick={next} style={styles.navArrow}>›</button>
          </div>
          <button style={styles.viewBtn}>Week <span style={{ fontSize: '10px' }}>⌄</span></button>
          <button style={styles.viewBtn}>List <span style={{ fontSize: '10px' }}>⌄</span></button>
        </div>
      </div>

      {/* ─── Timeline Grid ─── */}
      <div style={styles.scrollContainer}>
        <div style={{ ...styles.grid, gridTemplateColumns: `240px repeat(${days.length}, 120px)` }}>
          
          {/* Top-Left Corner (Empty) */}
          <div style={{ ...styles.cornerCell, ...styles.stickyTopLeft }}></div>

          {/* Day Headers */}
          {days.map((day, i) => {
            const current = isToday(day);
            return (
              <div key={i} style={{ ...styles.dayHeaderCell, ...styles.stickyTop }}>
                <div style={{ ...styles.dayName, color: current ? '#579dff' : '#8c9bab' }}>
                  {dayNames[day.getDay()]}
                </div>
                <div style={{ ...styles.dayNumber, color: current ? '#579dff' : '#b6c2cf' }}>
                  {day.getDate()}
                </div>
                {current && <div style={styles.todayIndicator}></div>}
              </div>
            );
          })}

          {/* List Rows */}
          {lists.map(list => {
            const unscheduledCount = list.cards.filter(c => !c.dueDate).length;
            
            return (
              <React.Fragment key={list.id}>
                {/* List Sidebar Cell */}
                <div style={{ ...styles.listCell, ...styles.stickyLeft }}>
                  <div style={styles.listTitle}>{list.title}</div>
                  <div style={styles.unscheduledRow}>
                    <span style={styles.unscheduledText}>({unscheduledCount}) Not scheduled</span>
                    <span 
                      style={styles.addIcon}
                      onClick={() => {
                        setNewCardListId(list.id);
                        setNewCardDueDate('');
                        setShowAddCardForm(true);
                        setShowAddListForm(false);
                      }}
                    >
                      +
                    </span>
                  </div>
                </div>

                {/* Day Cells for this List */}
                {days.map((day, j) => {
                  const dayCards = list.cards.filter(c => {
                    if (!c.dueDate) return false;
                    return new Date(c.dueDate).toDateString() === day.toDateString();
                  });

                  return (
                    <div key={j} style={styles.dayCell}>
                      {dayCards.map(card => (
                        <div key={card.id} style={styles.card} title={card.title}>
                          {card.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
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
  headerBar: {
    display: 'flex',
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

  scrollContainer: {
    flexGrow: 1,
    overflow: 'auto',
    backgroundColor: '#1d2125',
  },
  grid: {
    display: 'inline-grid',
    minWidth: '100%',
    minHeight: '100%',
  },
  
  /* Grid Cells */
  cornerCell: {
    backgroundColor: '#22272b',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  },
  dayHeaderCell: {
    backgroundColor: '#1d2125',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    padding: '8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  dayName: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  dayNumber: {
    fontSize: '16px',
    fontWeight: '500',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: '0',
    left: '15%',
    right: '15%',
    height: '2px',
    backgroundColor: '#579dff',
    borderRadius: '2px 2px 0 0',
  },
  
  listCell: {
    backgroundColor: '#22272b',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: '8px',
  },
  listTitle: {
    color: '#b6c2cf',
    fontSize: '14px',
    fontWeight: '500',
  },
  unscheduledRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unscheduledText: {
    color: '#579dff',
    fontSize: '12px',
    cursor: 'pointer',
  },
  addIcon: {
    color: '#579dff',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 4px',
  },

  dayCell: {
    backgroundColor: 'transparent',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minHeight: '80px',
  },
  card: {
    backgroundColor: '#282e33',
    color: '#b6c2cf',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '13px',
    boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.04)',
  },

  /* Sticky Positioning */
  stickyTopLeft: {
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 20,
  },
  stickyTop: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  stickyLeft: {
    position: 'sticky',
    left: 0,
    zIndex: 10,
  },

  /* ─── Add Popover Styles (from CalendarView) ─── */
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

export default TimelineView;
