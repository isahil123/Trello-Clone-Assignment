import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
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

/** All template mock data — keyed by category value for instant filtering */
const TEMPLATE_DATA = {
  popular: [
    { id: 't-pop-1', title: 'My Tasks | Trello', by: 'Trello Team', desc: 'Track all your to-dos in your own, private Trello board.', gradient: 'linear-gradient(135deg, #f87168, #fea362)' },
    { id: 't-pop-2', title: 'New Hire Onboarding', by: 'Trello Team', desc: 'Help new employees start strong with this onboarding template.', gradient: 'linear-gradient(135deg, #4bce97, #216e4e)' },
    { id: 't-pop-3', title: 'Tier List', by: 'Trello Engineering', desc: 'Rank items from best to worst using a powerful visual tier list.', gradient: 'linear-gradient(135deg, #579dff, #0c66e4)' },
  ],
  'small-business': [
    { id: 't-sb-1', title: 'Small Business CRM', by: 'Trello Team', desc: 'Manage your clients and sales pipeline with this lightweight CRM.', gradient: 'linear-gradient(135deg, #f5cd47, #d29034)' },
    { id: 't-sb-2', title: 'Budget Tracker', by: 'Community', desc: 'Keep your business finances organised and visible at a glance.', gradient: 'linear-gradient(135deg, #4bce97, #0c66e4)' },
  ],
  design: [
    { id: 't-des-1', title: 'Design Sprint', by: 'Trello Design', desc: 'Run a full Design Sprint process in 5 days.', gradient: 'linear-gradient(135deg, #e774bb, #c377e0)' },
    { id: 't-des-2', title: 'UI Component Library', by: 'Community', desc: 'Track design tokens, components and releases.', gradient: 'linear-gradient(135deg, #cd5a91, #89609e)' },
  ],
  education: [
    { id: 't-edu-1', title: 'Student Planner', by: 'Trello Team', desc: 'Organise assignments, exams and study sessions.', gradient: 'linear-gradient(135deg, #f5cd47, #fea362)' },
    { id: 't-edu-2', title: 'Lesson Planner', by: 'Community', desc: 'Plan weekly lessons and teaching resources.', gradient: 'linear-gradient(135deg, #519839, #4bce97)' },
  ],
  'engineering-it': [
    { id: 't-eng-1', title: 'Sprint Planning', by: 'Trello Engineering', desc: 'Manage Agile sprints with built-in velocity tracking.', gradient: 'linear-gradient(135deg, #9f8fef, #0c66e4)' },
    { id: 't-eng-2', title: 'Incident Response', by: 'Community', desc: 'Coordinate on-call response with clear priority lanes.', gradient: 'linear-gradient(135deg, #f87168, #b04632)' },
  ],
  marketing: [
    { id: 't-mkt-1', title: 'Content Calendar', by: 'Trello Team', desc: 'Plan, write and schedule your content pipeline.', gradient: 'linear-gradient(135deg, #6cc3e0, #00aecc)' },
    { id: 't-mkt-2', title: 'Campaign Tracker', by: 'Community', desc: 'Track marketing campaigns from kick-off to launch.', gradient: 'linear-gradient(135deg, #579dff, #cd5a91)' },
  ],
  hr: [
    { id: 't-hr-1', title: 'Recruitment Pipeline', by: 'Trello Team', desc: 'Track candidates from applied to hired.', gradient: 'linear-gradient(135deg, #4bce97, #0079bf)' },
    { id: 't-hr-2', title: 'Performance Review', by: 'Community', desc: 'Run structured quarterly performance reviews.', gradient: 'linear-gradient(135deg, #fea362, #f87168)' },
  ],
  operations: [
    { id: 't-ops-1', title: 'Project Tracker', by: 'Trello Team', desc: 'Manage any project end-to-end with this flexible tracker.', gradient: 'linear-gradient(135deg, #838c91, #a9abaf)' },
    { id: 't-ops-2', title: 'Vendor Management', by: 'Community', desc: 'Keep track of vendors, contracts and delivery milestones.', gradient: 'linear-gradient(135deg, #d29034, #e6a530)' },
  ],
  'sales-crm': [
    { id: 't-crm-1', title: 'Sales Pipeline', by: 'Trello Team', desc: 'Track deals from prospect to close with clear pipeline stages.', gradient: 'linear-gradient(135deg, #579dff, #0c66e4)' },
    { id: 't-crm-2', title: 'Account Management', by: 'Community', desc: 'Manage key accounts and renewal dates at a glance.', gradient: 'linear-gradient(135deg, #4bce97, #216e4e)' },
  ],
};

const Dashboard = ({ boards = [], onBoardsLoaded, isSidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      setCreating(true);
      const response = await apiClient.post('/boards', { title: newBoardTitle.trim() });
      const newBoard = response.data.data;
      onBoardsLoaded((prev) => [...prev, newBoard]);
      setNewBoardTitle('');
      setShowCreateModal(false);
      navigate(`/b/${newBoard.id}`);
    } catch (err) {
      console.error('Failed to create board:', err);
      alert('Could not create board. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getGradient = (index) => BOARD_GRADIENTS[index % BOARD_GRADIENTS.length];

  const renderBoardTile = (board, index) => (
    <div key={board.id} className="board-tile" onClick={() => navigate(`/b/${board.id}`)}>
      <div className="board-tile-bg" style={{ background: getGradient(index) }} />
      <div className="board-tile-footer">{board.title}</div>
    </div>
  );

  /** Templates currently shown based on the selected category */
  const visibleTemplates = TEMPLATE_DATA[selectedCategory] ?? TEMPLATE_DATA.popular;

  const handleUseTemplate = async (tpl) => {
    try {
      showToast(`Creating board from "${tpl.title}"...`);
      const res = await apiClient.post('/boards', { title: tpl.title });
      const newBoard = res.data.data;
      onBoardsLoaded((prev) => [...prev, newBoard]);
      setTimeout(() => navigate(`/b/${newBoard.id}`), 600);
    } catch {
      showToast('Could not create board from template.');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Shared sidebar with live active states */}
      <AppSidebar boards={boards} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-main-inner">

          {/* ── Templates Section ── */}
          <div className="templates-section">
            <div className="templates-header">
              <span className="icon" style={{ color: '#9fadbc' }}>
                <svg fill="currentColor" viewBox="0 0 16 16" width="24" height="24" role="presentation">
                  <path fillRule="evenodd" d="M12.25 2.25V0h1.5v2.25H16v1.5h-2.25V6h-1.5V3.75H10v-1.5zM3 2.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8.5H15V13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h4.5v1.5z" clipRule="evenodd" />
                </svg>
              </span>
              <h3 className="templates-title">Most popular templates</h3>
              <button className="templates-close" onClick={() => showToast('Templates panel closed')}>✕</button>
            </div>

            <div className="templates-subtitle">
              Get going faster with a template from the Trello community or{' '}
              <select
                className="template-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="popular">Popular</option>
                <option value="small-business">Small business</option>
                <option value="design">Design</option>
                <option value="education">Education</option>
                <option value="engineering-it">Engineering-IT</option>
                <option value="marketing">Marketing</option>
                <option value="hr">Human Resources</option>
                <option value="operations">Operations</option>
                <option value="sales-crm">Sales CRM</option>
              </select>
            </div>

            {/* Filtered template cards */}
            <div className="template-cards-row">
              {visibleTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="mini-template-card"
                  onClick={() => handleUseTemplate(tpl)}
                  title={`Use template: ${tpl.title}`}
                >
                  <div className="mini-template-thumb" style={{ background: tpl.gradient }} />
                  <div className="mini-template-info">
                    <div className="mini-template-title">{tpl.title}</div>
                    <div className="mini-template-by">by {tpl.by}</div>
                    <div className="mini-template-desc">{tpl.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              className="template-link"
              onClick={(e) => { e.preventDefault(); navigate('/templates'); }}
              href="/templates"
            >
              Browse the full template gallery →
            </a>
          </div>

          {/* ── Recently Viewed ── */}
          <div className="recently-viewed-section">
            <div className="section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#9fadbc' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
              </svg>
              <h3 className="section-title">Recently viewed</h3>
            </div>
            <div className="boards-grid">
              {boards.slice(0, 4).map((board, index) => renderBoardTile(board, index))}
            </div>
          </div>

          {/* ── YOUR WORKSPACES ── */}
          <div className="workspaces-section">
            <div className="section-subtitle">YOUR WORKSPACES</div>
            <div className="workspace-actions-header">
              <div className="workspace-actions-left">
                <div className="workspace-avatar" style={{ width: '32px', height: '32px', fontSize: '16px' }}>T</div>
                <h3 className="section-title" style={{ fontSize: '18px' }}>Trello Workspace</h3>
              </div>
              <div className="workspace-actions-right">
                <button className="workspace-action-btn" onClick={() => navigate('/')}>
                  <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v16H4V4zm10 0h6v8h-6V4z" /></svg></span>
                  Boards
                </button>
                <button className="workspace-action-btn" onClick={() => showToast('Info: Feature out of scope for this assignment.')}>
                  <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></span>
                  Members
                </button>
                <button className="workspace-action-btn" onClick={() => showToast('Info: Feature out of scope for this assignment.')}>
                  <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg></span>
                  Settings
                </button>
              </div>
            </div>
            <div className="boards-grid">
              {boards.map((board, index) => renderBoardTile(board, index))}
              <div className="create-board-tile" onClick={() => setShowCreateModal(true)}>
                Create new board
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Create Board Modal ── */}
      {showCreateModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">Create board</h3>
              <button className="dashboard-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="dashboard-modal-preview">
              <div className="preview-board">
                <div className="preview-list" />
                <div className="preview-list" />
                <div className="preview-list" style={{ width: '20%' }} />
              </div>
            </div>
            <form onSubmit={handleCreateBoard} className="dashboard-modal-form">
              <label className="dashboard-modal-label">
                Board title <span style={{ color: '#ef5c48' }}>*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="dashboard-modal-input"
                placeholder="e.g. Sprint 12, Q3 Marketing"
              />
              {!newBoardTitle.trim() && (
                <p className="dashboard-modal-hint">👋 Board title is required</p>
              )}
              <button
                type="submit"
                disabled={creating || !newBoardTitle.trim()}
                className="dashboard-modal-submit"
                style={{ opacity: newBoardTitle.trim() ? 1 : 0.5, cursor: newBoardTitle.trim() ? 'pointer' : 'not-allowed' }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#4bce97', color: '#1d2125', padding: '12px 24px',
          borderRadius: '24px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000, animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
