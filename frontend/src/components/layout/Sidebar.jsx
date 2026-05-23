import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBoard } from '../../context/BoardContext';

const Sidebar = ({ boards = [], activeBoardId, isOpen, setSidebarOpen }) => {
  const { currentView, setCurrentView } = useBoard();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Helper to handle navigation on mobile
  const handleNav = (path) => {
    navigate(path);
    if (setSidebarOpen) setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ ...styles.sidebar, width: isOpen ? '260px' : '0', minWidth: isOpen ? '260px' : '0', padding: isOpen ? '16px 12px' : '0', opacity: isOpen ? 1 : 0, overflow: 'hidden' }}>
        
        {/* Inbox Header */}
        <div style={styles.inboxHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📥</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>Inbox</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', color: '#9fadbc' }}>
            <span style={{ cursor: 'pointer' }}>≡</span>
            <span style={{ cursor: 'pointer' }}>•••</span>
          </div>
        </div>

        {/* Add a card input */}
        <div style={styles.addCardSection}>
          <div style={styles.addCardInputWrapper}>
            <input 
              type="text" 
              placeholder="Add a card" 
              style={styles.addCardInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.value = '';
                  // Simulate adding card
                }
              }}
            />
          </div>
          <div 
            style={{ backgroundColor: '#1c2b41', borderRadius: '8px', padding: '12px', marginTop: '8px', cursor: 'pointer' }}
            onClick={() => setShowEmailModal(true)}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#9fadbc' }}>
              See it, send it, save it for later
            </p>
            <div style={{ display: 'flex', gap: '12px', color: '#9fadbc', fontSize: '14px' }}>
              <span>✉</span>
              <span>—</span>
            </div>
          </div>
        </div>

        {/* Views Section */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ padding: '0 4px', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#9fadbc' }}>
            Board views
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['Board', 'Table', 'Calendar', 'Dashboard', 'Timeline', 'Map'].map(view => (
              <div 
                key={view}
                onClick={() => {
                  setCurrentView(view);
                  if(window.innerWidth < 768) setSidebarOpen(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 12px',
                  borderRadius: '4px', cursor: 'pointer',
                  backgroundColor: currentView === view ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentView === view ? '#579dff' : '#b6c2cf',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { if(currentView !== view) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}}
                onMouseLeave={(e) => { if(currentView !== view) e.currentTarget.style.backgroundColor = 'transparent'}}
              >
                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                  {view === 'Board' ? '▤' : view === 'Table' ? '☰' : view === 'Calendar' ? '📅' : view === 'Dashboard' ? '📊' : view === 'Timeline' ? '☷' : '📍'}
                </span>
                <span style={{ fontSize: '14px' }}>{view}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mail Feature - Consolidate your to-dos graphic (Moved down) */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#b6c2cf', padding: '32px 16px', marginTop: '32px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#fff' }}>Consolidate your to-dos</h3>
          <p style={{ margin: '0 0 32px 0', fontSize: '14px', lineHeight: '1.5', color: '#9fadbc' }}>Email it, say it, forward it — however it comes, get it into Trello fast.</p>
          
          <div style={{ width: '150px', height: '150px', backgroundColor: '#1c2b41', borderRadius: '50%', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid hsla(0,0%,100%,0.08)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #579dff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px', color: '#579dff' }}>✉️</span>
            </div>
            
            {/* Satellite icons */}
            <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#e774bb', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '2px solid #101828' }}>📱</div>
            <div style={{ position: 'absolute', bottom: '0px', left: '0px', background: '#4bce97', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '2px solid #101828' }}>💬</div>
            <div style={{ position: 'absolute', bottom: '30px', right: '-10px', background: '#fea362', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '2px solid #101828' }}>💻</div>
            <div style={{ position: 'absolute', top: '40px', left: '-20px', background: '#6cc3e0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#101828', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '2px solid #101828' }}>S</div>
            <div style={{ position: 'absolute', top: '0px', left: '30px', background: '#f5cd47', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#101828', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '2px solid #101828' }}>NEW</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#9fadbc', fontSize: '12px', paddingBottom: '16px' }}>
          🔒 Inbox is only visible to you
        </div>

        {/* Consolidate footer removed since it is now the main body */}
      </aside>

      {/* Add from email modal */}
      {showEmailModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#282e33', borderRadius: '8px', width: '600px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', color: '#b6c2cf' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid hsla(0,0%,100%,0.16)' }}>
              <div style={{ flex: 1 }}></div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Add from email</h2>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', color: '#9fadbc', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ width: '100%', height: '300px', backgroundColor: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden' }}>
                <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png" alt="Gmail" style={{ height: '32px' }} />
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#fff' }}>Add a card to your Inbox by emailing</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <a href="mailto:inbox@app.trello.com" style={{ color: '#579dff', textDecoration: 'none', fontSize: '14px' }}>inbox@app.trello.com</a>
                <span style={{ cursor: 'pointer', fontSize: '14px' }}>📋</span>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#9fadbc' }}>Make sure to send from the email address associated with your Trello account.</p>
              <button style={{ width: '100%', padding: '8px', backgroundColor: '#22272b', border: '1px solid hsla(0,0%,100%,0.16)', borderRadius: '3px', color: '#9fadbc', cursor: 'pointer', fontWeight: '500' }}>More options</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  sidebar: {
    backgroundColor: '#101828', // Dark navy blue matching the screenshot
    borderRight: '1px solid hsla(0, 0%, 100%, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    color: '#9fadbc',
    flexShrink: 0,
    height: '100%',
    transition: 'width 0.2s ease, min-width 0.2s ease, padding 0.2s ease',
  },
  inboxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '0 4px',
  },
  addCardSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  addCardInputWrapper: {
    backgroundColor: '#22272b',
    borderRadius: '4px',
    border: '1px solid #4a5d7c',
    padding: '8px',
  },
  addCardInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#b6c2cf',
    width: '100%',
    fontSize: '14px',
  },
  inboxMessage: {
    backgroundColor: '#1c2b41',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '8px',
  },
  consolidateFooter: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1c2b41',
    borderRadius: '24px',
    padding: '8px 16px',
    cursor: 'pointer',
    marginTop: 'auto',
  },
  footerAvatar: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #1c2b41',
    position: 'relative',
  }
};

export default Sidebar;
