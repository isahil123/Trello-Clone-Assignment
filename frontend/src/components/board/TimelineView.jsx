import React, { useState, useMemo } from 'react';

const TimelineView = ({ lists }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
                    <span style={styles.addIcon}>+</span>
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
                        <div key={card.id} style={styles.card}>
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
      
      {/* ─── Bottom Add Bar ─── */}
      <div style={styles.bottomBar}>
        <button style={styles.addBtn}>+ Add</button>
      </div>
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
    cursor: 'pointer',
  },
  unscheduledText: {
    color: '#579dff',
    fontSize: '12px',
  },
  addIcon: {
    color: '#579dff',
    fontSize: '16px',
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

  /* Bottom Bar */
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
  }
};

export default TimelineView;
