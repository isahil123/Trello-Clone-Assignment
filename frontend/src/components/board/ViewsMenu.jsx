import React, { useRef, useEffect } from 'react';

const ViewsMenu = ({ showViewsMenu, setShowViewsMenu, currentView, setCurrentView }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowViewsMenu(false);
      }
    };
    if (showViewsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showViewsMenu, setShowViewsMenu]);

  if (!showViewsMenu) return null;

  const handleSelectView = (view) => {
    setCurrentView(view);
    setShowViewsMenu(false);
  };

  const views = [
    { id: 'Board', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v5h3a.75.75 0 0 1 .75.75 1.75 1.75 0 1 0 3.5 0A.75.75 0 0 1 10.5 8h3V3a.5.5 0 0 0-.5-.5zm10.5 7h-2.337a3.251 3.251 0 0 1-6.326 0H2.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5zM12 6H4V4.5h8z" clipRule="evenodd" /></svg>, label: 'Board' },
    { id: 'Table', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v3.25H5V3.5zm4.5 0v3.75h8V4a.5.5 0 0 0-.5-.5zm8 5.25h-8v3.75H14a.5.5 0 0 0 .5-.5zM5 12.5V8.75H1.5V12a.5.5 0 0 0 .5.5z" clipRule="evenodd" /></svg>, label: 'Table' },
    { id: 'Calendar', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M4.5 2.5v2H6v-2h4v2h1.5v-2H13a.5.5 0 0 1 .5.5v3h-11V3a.5.5 0 0 1 .5-.5zm-2 5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.5zm9-6.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1.5V0H6v1h4V0h1.5z" clipRule="evenodd" /></svg>, label: 'Calendar' },
    { id: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v3.25H5V3.5zm4.5 0v3.75h8V4a.5.5 0 0 0-.5-.5zm8 5.25h-8v3.75H14a.5.5 0 0 0 .5-.5zM5 12.5V8.75H1.5V12a.5.5 0 0 0 .5.5z" clipRule="evenodd" /></svg>, label: 'Dashboard' },
    { id: 'Timeline', icon: '☷', label: 'Timeline' },
    { id: 'Map', icon: '📍', label: 'Map' },
  ];

  return (
    <div ref={menuRef} style={styles.menuContainer}>
      <div style={styles.header}>
        <span style={styles.title}>Views</span>
        <button style={styles.closeBtn} onClick={() => setShowViewsMenu(false)}>✕</button>
      </div>

      <div className="aFGD9vtcIAqeiM">
        <div style={styles.menuList}>
          {views.map((v) => (
            <button 
              key={v.id} 
              style={{
                ...styles.menuItem,
                backgroundColor: currentView === v.id ? '#579dff29' : 'transparent',
                color: currentView === v.id ? '#579dff' : '#b6c2cf'
              }}
              onClick={() => handleSelectView(v.id)}
            >
              <span style={styles.icon}>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  menuContainer: {
    position: 'absolute',
    top: '36px',
    left: '0',
    width: '320px',
    backgroundColor: '#282e33',
    borderRadius: '8px',
    boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)',
    zIndex: 200,
    color: '#b6c2cf',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    flexGrow: 1,
    textAlign: 'center',
    marginLeft: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#9fadbc',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuItem: {
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '4px',
    textAlign: 'left',
    transition: 'background-color 0.1s',
  },
  icon: {
    fontSize: '16px',
    width: '24px',
    textAlign: 'center',
  }
};

export default ViewsMenu;
