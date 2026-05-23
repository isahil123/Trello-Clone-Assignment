import { useNavigate } from 'react-router-dom';
import { toast as hotToast } from 'react-hot-toast';
import AppSidebar from '../layout/AppSidebar';
import './Dashboard.css';

const BOARD_GRADIENTS = [
  'linear-gradient(135deg, #0079bf, #0c66e4)',
  'linear-gradient(135deg, #d29034, #e6a530)',
  'linear-gradient(135deg, #519839, #4bce97)',
  'linear-gradient(135deg, #b04632, #e74c3c)',
  'linear-gradient(135deg, #89609e, #c377e0)',
  'linear-gradient(135deg, #cd5a91, #ff78cb)',
  'linear-gradient(135deg, #00aecc, #6cc3e0)',
  'linear-gradient(135deg, #838c91, #a9abaf)',
];

/**
 * Home page — distinct /home route.
 * Shows a personalized greeting, star-able boards, and recent activity.
 */
const HomePage = ({ boards }) => {
  const navigate = useNavigate();
  const getGradient = (i) => BOARD_GRADIENTS[i % BOARD_GRADIENTS.length];

  return (
    <div className="dashboard-layout">
      <AppSidebar boards={boards} />

      <div className="dashboard-content">
        <div className="dashboard-main-inner">

          {/* Hero greeting */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(87,157,255,0.12), rgba(196,125,255,0.08))',
            borderRadius: '16px',
            border: '1px solid hsla(0,0%,100%,0.08)',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff78cb, #c377e0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>U</div>
            <div>
              <h2 style={{ margin: '0 0 4px', color: '#fff', fontSize: '22px' }}>
                👋 Welcome back, User!
              </h2>
              <p style={{ margin: 0, color: '#9fadbc', fontSize: '14px' }}>
                Here's what's happening across your boards today.
              </p>
            </div>
          </div>

          {/* Your boards */}
          <div className="recently-viewed-section">
            <div className="section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#9fadbc' }}>
                <path d="M4 4h6v16H4V4zm10 0h6v8h-6V4z" />
              </svg>
              <h3 className="section-title">Your boards</h3>
            </div>
            {boards.length === 0 ? (
              <p style={{ color: '#9fadbc', fontSize: '14px' }}>
                No boards yet.{' '}
                <span
                  style={{ color: '#579dff', cursor: 'pointer' }}
                  onClick={() => navigate('/')}
                >
                  Create one now →
                </span>
              </p>
            ) : (
              <div className="boards-grid">
                {boards.map((board, i) => (
                  <div
                    key={board.id}
                    className="board-tile"
                    onClick={() => navigate(`/b/${board.id}`)}
                  >
                    <div className="board-tile-bg" style={{ background: getGradient(i) }} />
                    <div className="board-tile-footer">{board.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ marginTop: '40px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Quick actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: '📋 View Templates', path: '/templates' },
                { label: '👥 Manage Members', path: '/members' },
                { label: '⚙️ Workspace Settings', path: '/settings' },
                { label: '💳 Billing', path: '/billing' },
              ].map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => {
                    const isOutOfScope = ['/settings', '/billing'].includes(path);
                    if (isOutOfScope) {
                      hotToast('Info: Feature out of scope for this assignment.', { icon: 'ℹ️' });
                    } else {
                      navigate(path);
                    }
                  }}
                  style={{
                    background: 'hsla(0,0%,100%,0.06)',
                    border: '1px solid hsla(0,0%,100%,0.12)',
                    borderRadius: '12px',
                    color: '#b6c2cf',
                    padding: '10px 18px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'hsla(0,0%,100%,0.12)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'hsla(0,0%,100%,0.06)';
                    e.currentTarget.style.color = '#b6c2cf';
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
