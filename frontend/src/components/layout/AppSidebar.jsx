import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * AppSidebar — Shared navigation sidebar used by Dashboard, Templates and Home pages.
 * Uses useLocation() so active states are always in sync with the current route.
 */
const AppSidebar = ({ boards = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleOutOfScope = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toast('Info: Feature out of scope for this assignment.', { icon: 'ℹ️' });
  };

  const navItem = (path, label, Icon) => (
    <div
      className={`sidebar-nav-item${isActive(path) ? ' active' : ''}`}
      onClick={() => navigate(path)}
    >
      <span className="icon">{Icon}</span>
      {label}
    </div>
  );

  return (
    <div className="dashboard-sidebar">
      {/* Top nav links */}
      <div className="sidebar-nav">
        {navItem('/', 'Boards',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h6v16H4V4zm10 0h6v8h-6V4z" />
          </svg>
        )}
        <div
          className={`sidebar-nav-item${isActive('/templates') ? ' active' : ''}`}
          onClick={() => navigate('/templates')}
        >
          <span className="icon">
            <svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16" role="presentation">
              <path fillRule="evenodd" d="M12.25 2.25V0h1.5v2.25H16v1.5h-2.25V6h-1.5V3.75H10v-1.5zM3 2.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8.5H15V13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h4.5v1.5z" clipRule="evenodd" />
            </svg>
          </span>
          Templates
        </div>
        {navItem('/home', 'Home',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        )}
      </div>

      {/* Workspaces accordion */}
      <div className="sidebar-workspaces">
        <div className="workspace-header">
          <span>Workspaces</span>
          <span className="add-icon" title="Create workspace">+</span>
        </div>

        <div className={`workspace-accordion${workspaceOpen ? ' open' : ''}`}>
          <div
            className="workspace-accordion-header"
            onClick={() => setWorkspaceOpen((o) => !o)}
          >
            <div className="workspace-avatar">T</div>
            <span>Trello Workspace</span>
            <span className="icon" style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: workspaceOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
              </svg>
            </span>
          </div>

          {workspaceOpen && (
            <div className="workspace-accordion-content">
              <div
                className={`accordion-item${isActive('/') ? ' active' : ''}`}
                onClick={() => navigate('/')}
              >
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h6v16H4V4zm10 0h6v8h-6V4z" />
                  </svg>
                </span>
                Boards
              </div>

              <div
                className={`accordion-item${isActive('/members') ? ' active' : ''}`}
                onClick={() => navigate('/members')}
              >
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </span>
                Members
                <span className="add-icon">+</span>
              </div>

              <div
                className={`accordion-item${isActive('/settings') ? ' active' : ''}`}
                onClick={() => navigate('/settings')}
              >
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </span>
                Settings
              </div>

              <div
                className={`accordion-item${isActive('/billing') ? ' active' : ''}`}
                onClick={() => navigate('/billing')}
              >
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </span>
                Billing
              </div>

              <div
                className={`accordion-item${isActive('/linked-projects') ? ' active' : ''}`}
                onClick={() => navigate('/linked-projects')}
              >
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                  </svg>
                </span>
                Linked projects
                <span className="external-icon">↗</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent boards in sidebar */}
      {boards.length > 0 && (
        <div className="sidebar-recent-boards">
          <div className="sidebar-section-label">Recently viewed</div>
          {boards.slice(0, 5).map((board, i) => {
            const colors = ['#0079bf', '#d29034', '#519839', '#b04632', '#89609e'];
            return (
              <div
                key={board.id}
                className="sidebar-board-item"
                onClick={() => navigate(`/b/${board.id}`)}
              >
                <div
                  className="sidebar-board-dot"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="sidebar-board-label">{board.title}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppSidebar;
