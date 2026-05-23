import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast as hotToast } from 'react-hot-toast';
import apiClient from '../../api/client';
import './TopNav.css';

const CURRENT_USER = { name: 'User', initials: 'U', role: 'Default Admin' };

const TopNav = ({ setSidebarOpen, onBoardCreated }) => {
  const navigate = useNavigate();

  // ── Search ──
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ boards: [], cards: [] });
  const [isSearching, setIsSearching] = useState(false);

  // ── Single Active State for Menus ──
  const [activePopup, setActivePopup] = useState(null);
  const togglePopup = (popupName) => setActivePopup(prev => prev === popupName ? null : popupName);

  // ── Create modal (keeps separate state as it's a fullscreen overlay) ──
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // ── Notifications ──
  const [hasNotification, setHasNotification] = useState(true);

  // ── Theme ──
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ── Popovers refs ──
  const navRef = useRef(null);

  // ── Toast ──
  const showToast = (message) => {
    if (message === 'Create Workspace coming soon' || message === 'ℹ️ Help center' || message.includes('Log out') || message.includes('opened') || message.includes('coming soon')) {
      hotToast('Info: Feature out of scope for this assignment.', { icon: 'ℹ️' });
    } else {
      hotToast(message);
    }
  };

  // ── Theme toggle: adds/removes 'light-mode' class on <html> ──
  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('light-mode');
      showToast('☀️ Light mode on');
    } else {
      html.classList.remove('light-mode');
      showToast('🌙 Dark mode on');
    }
    setIsDarkMode((prev) => !prev);
  };

  // ── Close menus when clicking outside ──
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search debounce ──
  const performSearch = async (query) => {
    try {
      setIsSearching(true);
      const res = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) performSearch(searchQuery);
      else setSearchResults({ boards: [], cards: [] });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (type, item) => {
    if (type === 'board') navigate(`/b/${item.id}`);
    else if (type === 'card') navigate(`/b/${item.list.boardId}`);
    setSearchQuery('');
    setSearchFocused(false);
  };

  // ── Create Board: optimistic UI ──
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    const title = boardTitle.trim();
    if (!title) return;

    // 1. Optimistic: generate a temp board and notify parent immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticBoard = { id: tempId, title, isOptimistic: true };
    if (onBoardCreated) onBoardCreated(optimisticBoard);

    setIsCreateBoardModalOpen(false);
    setBoardTitle('');
    setActivePopup(null);
    navigate(`/b/${tempId}`); // navigate immediately while API call goes out

    try {
      setIsCreating(true);
      const res = await apiClient.post('/boards', { title });
      const realBoard = res.data.data;
      // 2. Reconcile: replace optimistic board with real one from server
      if (onBoardCreated) onBoardCreated(realBoard, tempId);
      navigate(`/b/${realBoard.id}`);
    } catch (err) {
      console.error('Failed to create board:', err);
      showToast('❌ Failed to create board. Please retry.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <nav className="topnav" ref={navRef}>
        {/* ── Left ── */}
        <div className="topnav-left">
          <button className="topnav-btn mobile-menu-btn" title="Menu" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <button className="topnav-btn app-switcher-btn" title="App switcher" onClick={() => showToast('App switcher')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </button>

          <button className="topnav-logo" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
              <rect x="6" y="6" width="4" height="12" rx="1" fill="#1d2125" />
              <rect x="14" y="6" width="4" height="6" rx="1" fill="#1d2125" />
            </svg>
            <span className="topnav-logo-text">Trello</span>
          </button>

          {/* Create button + dropdown */}
          <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
            <button className="topnav-create-btn" onClick={() => togglePopup('create')}>
              Create
            </button>

            {activePopup === 'create' && (
              <div className="topnav-menu">
                {/* Create board → opens modal */}
                <div
                  className="topnav-menu-item"
                  onClick={() => { setActivePopup(null); setIsCreateBoardModalOpen(true); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h6v16H4V4zm10 0h6v8h-6V4z" />
                  </svg>
                  Create board
                </div>
                <div
                  className="topnav-menu-item"
                  onClick={() => { setActivePopup(null); navigate('/templates'); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
                  </svg>
                  Start with a template
                </div>
                <div
                  className="topnav-menu-item"
                  onClick={() => { setActivePopup(null); showToast('Create Workspace coming soon'); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Create Workspace
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Middle: Search ── */}
        <div className="topnav-middle">
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <div className={`topnav-search-wrapper ${searchFocused ? 'focused' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="topnav-search-icon">
                <path d="M10.5 3a7.5 7.5 0 015.645 12.438l4.709 4.708a1 1 0 01-1.415 1.415l-4.708-4.709A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="topnav-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
            </div>

            {searchFocused && searchQuery && (
              <div style={styles.searchResults}>
                {isSearching ? (
                  <div style={styles.searchMessage}>Searching...</div>
                ) : (
                  <>
                    {searchResults.boards.length > 0 && (
                      <div style={styles.searchSection}>
                        <div style={styles.searchSectionTitle}>RECENT BOARDS</div>
                        {searchResults.boards.map((b) => (
                          <div 
                            key={b.id} 
                            style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.1s' }} 
                            onClick={() => handleResultClick('board', b)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ width: '24px', height: '24px', borderRadius: '3px', background: 'linear-gradient(to bottom right, #f87168, #9f8fef)', flexShrink: 0 }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '14px', color: '#b6c2cf', fontWeight: '500' }}>{b.title}</span>
                              <span style={{ fontSize: '12px', color: '#9fadbc' }}>Trello Workspace</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.cards.length > 0 && (
                      <div style={styles.searchSection}>
                        <div style={styles.searchSectionTitle}>CARDS</div>
                        {searchResults.cards.map((c) => (
                          <div 
                            key={c.id} 
                            style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.1s' }} 
                            onClick={() => handleResultClick('card', c)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ width: '24px', height: '24px', borderRadius: '3px', backgroundColor: '#22272b', border: '1px solid #738496', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: '#9fadbc', fontSize: '12px' }}>📝</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '14px', color: '#b6c2cf', fontWeight: '500' }}>{c.title}</span>
                              <span style={{ fontSize: '12px', color: '#9fadbc' }}>in {c.list?.board?.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.boards.length === 0 && searchResults.cards.length === 0 && (
                      <div style={styles.searchMessage}>No results found</div>
                    )}
                    
                    <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.16)', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b6c2cf', cursor: 'pointer' }}
                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10.5 3a7.5 7.5 0 015.645 12.438l4.709 4.708a1 1 0 01-1.415 1.415l-4.708-4.709A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
                      </svg>
                      <span style={{ fontSize: '14px' }}>Advanced search</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right ── */}
        <div className="topnav-right">

          {/* Bell with notification dot */}
          <div style={{ position: 'relative' }}>
            <button
              className="topnav-btn"
              title="Notifications"
              onClick={() => {
                setHasNotification(false); 
                togglePopup('notifications');
              }}
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
            {hasNotification && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#ef5c48',
                border: '2px solid #1d2125',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            )}
            </button>
            {activePopup === 'notifications' && (
              <div style={{...styles.profilePopover, minWidth: '280px', zIndex: 50}}>
                <div style={{...styles.profilePopoverHeader, borderBottom: '1px solid hsla(0,0%,100%,0.16)', padding: '12px'}}>
                  <div style={{...styles.profilePopoverName, textAlign: 'center', width: '100%'}}>Notifications</div>
                </div>
                <div style={{padding: '24px 12px', textAlign: 'center', color: '#9fadbc', fontSize: '14px'}}>
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <button className="topnav-btn" onClick={() => showToast('ℹ️ Help center')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
          </button>


          {/* Profile avatar with popover */}
          <div style={{ position: 'relative', zIndex: 50 }}>
            <div
              className="topnav-avatar"
              title={`${CURRENT_USER.name} — ${CURRENT_USER.role}`}
              onClick={() => togglePopup('profile')}
              style={{ cursor: 'pointer' }}
            >
              <span>{CURRENT_USER.initials}</span>
            </div>

            {activePopup === 'profile' && (
              <div style={styles.profilePopover}>
                <div style={styles.profilePopoverHeader}>
                  <div style={styles.profilePopoverAvatar}>{CURRENT_USER.initials}</div>
                  <div>
                    <div style={styles.profilePopoverName}>{CURRENT_USER.name}</div>
                    <div style={styles.profilePopoverRole}>{CURRENT_USER.role}</div>
                  </div>
                </div>
                <div style={styles.profileDivider} />
                {[
                  { label: '👤 Profile & Visibility', path: '/settings/profile' },
                  { label: '⚡ Activity', path: '/settings/activity' },
                  { label: '🃏 Cards', path: '/settings/cards' },
                  { label: '⚙️ Settings', path: '/settings/account' },
                  { label: '🧪 Labs', path: '/settings/labs' },
                ].map(({ label, path }) => (
                  <div
                    key={path}
                    style={styles.profileMenuItem}
                    onClick={() => { setActivePopup(null); showToast(`${label.replace(/[^a-zA-Z &]/g, '').trim()} coming soon`); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsla(0,0%,100%,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {label}
                  </div>
                ))}
                <div style={styles.profileDivider} />
                <div
                  style={{ ...styles.profileMenuItem, color: '#ef5c48' }}
                  onClick={() => { setActivePopup(null); showToast('👋 Logged out'); }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsla(239,0%,100%,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Log out
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Create Board Modal ── */}
      {isCreateBoardModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsCreateBoardModalOpen(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create board</h3>
              <button style={styles.modalClose} onClick={() => setIsCreateBoardModalOpen(false)}>✕</button>
            </div>

            {/* Mini board preview */}
            <div style={styles.modalPreview}>
              <div style={{ display: 'flex', gap: '8px', padding: '12px', height: '100%', alignItems: 'flex-start' }}>
                {[60, 80, 50].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'rgba(255,255,255,0.18)', borderRadius: '6px' }} />
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateBoard} style={styles.modalForm}>
              <label style={styles.modalLabel}>
                Board title <span style={{ color: '#ef5c48' }}>*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                placeholder="e.g. Sprint 12, Q3 Marketing"
                style={styles.modalInput}
              />
              {!boardTitle.trim() && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9fadbc' }}>
                  👋 Board title is required
                </p>
              )}
              <button
                type="submit"
                disabled={isCreating || !boardTitle.trim()}
                style={{
                  ...styles.modalSubmit,
                  opacity: boardTitle.trim() ? 1 : 0.5,
                  cursor: boardTitle.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  searchResults: {
    position: 'absolute', top: '40px', left: 0, width: '100%',
    backgroundColor: '#282e33', borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid #738496',
    zIndex: 100, maxHeight: '400px', overflowY: 'auto',
  },
  searchSection: { padding: '8px 0' },
  searchSectionTitle: { padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', color: '#9fadbc', textTransform: 'uppercase' },
  searchResultItem: { padding: '8px 12px', cursor: 'pointer', fontSize: '14px', color: '#b6c2cf' },
  searchMessage: { padding: '12px', color: '#9fadbc', fontSize: '14px', textAlign: 'center' },

  /* Profile popover */
  profilePopover: {
    position: 'absolute', top: '40px', right: 0,
    backgroundColor: '#282e33', border: '1px solid hsla(0,0%,100%,0.16)',
    borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 1000, minWidth: '240px', padding: '8px',
    animation: 'fadeIn 0.15s ease-out',
  },
  profilePopoverHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '8px 12px 12px',
  },
  profilePopoverAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff78cb, #c377e0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '16px', color: '#fff', flexShrink: 0,
  },
  profilePopoverName: { fontWeight: 600, fontSize: '14px', color: '#fff' },
  profilePopoverRole: { fontSize: '12px', color: '#9fadbc', marginTop: '2px' },
  profileDivider: { height: '1px', background: 'hsla(0,0%,100%,0.1)', margin: '4px 0' },
  profileMenuItem: {
    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', color: '#b6c2cf', transition: 'background 0.15s',
    backgroundColor: 'transparent',
  },

  /* Create board modal */
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1500, backdropFilter: 'blur(2px)',
  },
  modal: {
    backgroundColor: '#282e33', borderRadius: '16px', width: '360px',
    overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.2s ease',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 16px 0',
  },
  modalTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' },
  modalClose: {
    background: 'none', border: 'none', color: '#9fadbc',
    cursor: 'pointer', fontSize: '16px', padding: '4px',
  },
  modalPreview: {
    margin: '16px', height: '100px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #0079bf, #0c66e4)',
    overflow: 'hidden',
  },
  modalForm: { padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  modalLabel: { fontSize: '12px', fontWeight: 700, color: '#9fadbc', textTransform: 'uppercase', letterSpacing: '0.04em' },
  modalInput: {
    backgroundColor: '#22272b', border: '2px solid #579dff',
    borderRadius: '8px', color: '#fff', padding: '8px 12px',
    fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  modalSubmit: {
    backgroundColor: '#579dff', color: '#1d2125', border: 'none',
    borderRadius: '8px', padding: '10px 16px', fontWeight: 700,
    fontSize: '14px', marginTop: '8px', transition: 'all 0.2s ease',
  },
};

export default TopNav;
