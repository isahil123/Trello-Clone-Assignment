import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast as hotToast } from 'react-hot-toast';
import apiClient from '../../api/client';

const WorkspacePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    
    if (path === '/members') {
      setLoading(true);
      setError(null);
      const fetchUsers = async () => {
        try {
          const res = await apiClient.get('/users');
          if (!isMounted) return;
          const mappedUsers = (res.data.data || []).map(u => {
            if (u.name.toLowerCase().includes('sahil')) {
              return { ...u, name: 'User', email: 'user123@example.com' };
            }
            return u;
          });
          setUsers(mappedUsers);
        } catch (err) {
          console.error('Error fetching users:', err);
          if (isMounted) setError('Could not load users. Please make sure the backend is running.');
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchUsers();
    } else {
      // Defer state update to avoid synchronous cascade render warning
      Promise.resolve().then(() => {
        if (isMounted) setLoading(false);
      });
    }

    return () => { isMounted = false; };
  }, [path]);

  const renderSidebar = () => {
    // Active nav item: blue left border + subtle bg, exactly like Trello
    const navItem = (targetPath, label, badge = null) => {
      const isActive = path === targetPath;
      
      const handleClick = (e) => {
        navigate(targetPath);
      };

      return (
        <div
          key={targetPath}
          onClick={handleClick}
          style={{
            ...styles.sidebarNavItem,
            ...(isActive ? styles.sidebarNavItemActive : {}),
          }}
        >
          {label}
          {badge && <span style={styles.premiumBadge}>{badge}</span>}
        </div>
      );
    };

    return (
      <div style={styles.sidebar}>
        {/* ── Personal Settings ── */}
        <div style={styles.sidebarSection}>
          <div style={styles.sidebarSectionTitle}>Personal Settings</div>
          {navItem('/settings/profile', 'Profile and Visibility')}
          {navItem('/settings/activity', 'Activity')}
          {navItem('/settings/cards', 'Cards')}
          {navItem('/settings/account', 'Settings')}
          {navItem('/settings/labs', 'Labs')}
        </div>

        {/* ── Workspace ── */}
        <div style={styles.sidebarSection}>
          <div style={styles.sidebarSectionTitle}>Workspace</div>
          <div style={styles.sidebarWsHeader}>
            <div style={styles.wsMiniIcon}>T</div>
            <div style={{ fontWeight: '600' }}>Trello Workspace</div>
          </div>
          {navItem('/', 'Boards')}
          {navItem('/members', 'Members')}
          {navItem('/settings', 'Settings')}
          {navItem('/power-ups', 'Power-Ups', 'Premium')}
          {navItem('/billing', 'Billing')}
          {navItem('/export', 'Export', 'Premium')}
        </div>

        {/* ── Jira ── */}
        <div style={styles.sidebarSection}>
          <div style={styles.sidebarSectionTitle}>Jira</div>
          {navItem('/linked-projects', 'Linked projects')}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (path) {
      case '/members':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Collaborators (1)</h2>
            <div style={styles.membersTabs}>
              <div style={styles.membersTabActive}>Members (1)</div>
              <div style={styles.membersTab}>Single-board guests (0)</div>
              <div style={styles.membersTab}>Multi-board guests (0)</div>
              <div style={styles.membersTab}>Join requests (0)</div>
            </div>
            
            <p style={styles.descriptionText}>
              Workspace members can view and join all Workspace visible boards and create new boards in the Workspace. Adding new members will automatically update your billing.
            </p>

            <div style={styles.card}>
              <div style={styles.memberList}>
                {loading ? <p style={styles.loadingText}>Loading members...</p> : error ? <p style={{ color: '#ef5c48', padding: '16px 24px', margin: 0 }}>{error}</p> : (users.length > 0 ? users : [{id: '1', name: 'User', email: 'user123@example.com'}]).map(user => (
                  <div key={user.id} style={styles.memberRow}>
                    <div style={styles.memberAvatar}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} style={styles.avatarImg} />
                      ) : (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div style={styles.memberDetails}>
                      <div style={styles.memberName}>{user.name} @{user.name.toLowerCase().replace(/\s+/g, '')}123</div>
                      <div style={styles.memberActivity}>Last active May 2026</div>
                    </div>
                    <div style={styles.memberRole}>Admin</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case '/settings':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Workspace settings</h2>
            
            <div style={styles.settingBlock}>
              <div style={styles.wsMiniIconLarge}>T</div>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Trello Workspace</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={styles.premiumBadgeLabel}>Premium</span>
                  <span style={styles.privateBadge}>Private</span>
                </div>
              </div>
            </div>

            <div style={styles.aiBlock}>
              <h3 style={{ margin: '0 0 8px 0', color: '#b6c2cf' }}>AI <span style={styles.premiumBadge}>Premium</span></h3>
              <p style={{ margin: '0 0 8px 0' }}><strong>AI is activated for all boards in this Workspace.</strong></p>
              <p style={styles.descriptionText}>AI is an artificial intelligence tool to help generate, improve, and summarize content while writing on Trello.</p>
              <a href="#" style={styles.linkText} onClick={(e) => { e.preventDefault(); showToast("Redirecting to AI documentation..."); }}>Learn About AI</a>
            </div>

            <h3 style={styles.settingSectionTitle}>Workspace visibility</h3>
            <p style={styles.descriptionText}><strong>Private</strong> – This Workspace is private. It's not indexed or visible to those outside the Workspace.</p>

            <h3 style={styles.settingSectionTitle}>Workspace membership restrictions</h3>
            <p style={styles.descriptionText}>Anyone can be added to this Workspace.</p>

            <h3 style={styles.settingSectionTitle}>Board creation restrictions</h3>
            <ul style={styles.restrictionList}>
              <li>Any Workspace member can create public boards.</li>
              <li>Any Workspace member can create Workspace visible boards.</li>
              <li>Any Workspace member can create private boards.</li>
            </ul>

            <h3 style={styles.settingSectionTitle}>Board deletion restrictions</h3>
            <ul style={styles.restrictionList}>
              <li>Any Workspace member can delete public boards.</li>
              <li>Any Workspace member can delete Workspace visible boards.</li>
              <li>Any Workspace member can delete private boards.</li>
            </ul>

            <h3 style={styles.settingSectionTitle}>Sharing boards with guests</h3>
            <p style={styles.descriptionText}>Anybody can send or receive invitations to boards in this Workspace.</p>

            <h3 style={styles.settingSectionTitle}>Slack workspaces restrictions</h3>
            <p style={styles.descriptionText}>Any Workspace member can link and unlink this Trello Workspace with Slack workspaces.</p>

            <h3 style={styles.settingSectionTitle}>Slack workspaces linking</h3>
            <p style={styles.descriptionText}>Link your Slack and Trello Workspaces together to collaborate on Trello projects from within Slack. <a href="#" style={styles.linkText} onClick={(e) => { e.preventDefault(); showToast("Loading Slack docs..."); }}>Learn more.</a></p>
            <button style={styles.actionButton} onClick={() => showToast("Authorizing Slack integration...")}>Add to Slack</button>

            <div style={{ marginTop: '32px', color: '#9fadbc', fontSize: '14px' }}>
              Need to delete your Workspace? Please cancel your Premium subscription on the billing tab first.
            </div>
          </div>
        );
      case '/power-ups':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Power-Ups enabled on Workspace boards <span style={styles.premiumBadge}>Premium</span></h2>
            <p style={styles.descriptionText}>Power-Ups are not enabled on any of your Workspace boards.</p>
          </div>
        );
      case '/billing':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Billing</h2>
            <p style={styles.descriptionText}>Upgrade to capture, organize, and tackle your to-dos from anywhere</p>
            
            <div style={styles.billingFeaturesGrid}>
              <div style={styles.featureItem}>
                <h4>Planner</h4>
                <p>Drag and drop cards on a calendar to block any available time. Sync with more events in your favorite tools.</p>
              </div>
              <div style={styles.featureItem}>
                <h4>Collapsible lists and list colors</h4>
                <p>Collapse and expand lists. Choose different colors for each list in your board.</p>
              </div>
              <div style={styles.featureItem}>
                <h4>Mirror cards</h4>
                <p>Mirror cards to view or edit from different boards.</p>
              </div>
              <div style={styles.featureItem}>
                <h4>AI</h4>
                <p>Let AI handle summaries, due dates, descriptions, checklists, and more.</p>
              </div>
              <div style={styles.featureItem}>
                <h4>Unlimited automations</h4>
                <p>Automate your workflow with no code.</p>
              </div>
              <div style={styles.featureItem}>
                <h4>Unlimited boards</h4>
                <p>Organize and manage as many projects as you want in your Workspace.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <a href="#" style={styles.linkText} onClick={(e) => { e.preventDefault(); showToast("Connecting to support..."); }}>Contact support</a>
              <span style={{ color: '#9fadbc' }}>·</span>
              <a href="#" style={styles.linkText} onClick={(e) => { e.preventDefault(); showToast("Opening help center..."); }}>Learn more</a>
            </div>

            <div style={styles.trialBanner}>
              This Workspace has a Trello Premium free trial!
            </div>

            <div style={styles.planSelection}>
              <div style={styles.planCard} onClick={() => showToast("Selected Standard Plan")}>
                <h4>Trello Standard</h4>
                <div style={styles.planPrice}>$5 USD</div>
                <div style={styles.planSub}>Per user per month billed annually<br/>($6 billed monthly)</div>
              </div>
              <div style={styles.planCardActive} onClick={() => showToast("Selected Premium Plan")}>
                <h4>Trello Premium</h4>
                <div style={styles.planPrice}>$10 USD</div>
                <div style={styles.planSub}>Per user per month billed annually<br/>($12.50 billed monthly)</div>
              </div>
            </div>

            <div style={styles.paymentSection}>
              <h3 style={styles.settingSectionTitle}>Payment information</h3>
              <p style={styles.descriptionText}>Step 1 of 2</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                <input placeholder="Card Number*" style={styles.inputField} />
                <input placeholder="Expiration Date*" style={styles.inputField} />
                <input placeholder="CVV*" style={styles.inputField} />
                <select style={styles.inputField}><option>United States</option></select>
                <input placeholder="ZIP/Postal Code*" style={styles.inputField} />
                <button style={styles.actionButton} onClick={() => showToast("Processing payment details...")}>Continue to Step 2</button>
              </div>
            </div>

            <div style={styles.billingSummary}>
              <h3 style={styles.settingSectionTitle}>Billing summary</h3>
              <div style={styles.billingRow}>
                <span>Billing cycle</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label><input type="radio" name="cycle" /> Monthly</label>
                  <label><input type="radio" name="cycle" defaultChecked /> Annually</label>
                </div>
              </div>
              <div style={styles.billingRow}>
                <span>1 Trello annual license<br/><small style={{ color: '#9fadbc' }}>$119.99 USD each</small></span>
                <span>$119.99 USD</span>
              </div>
              <div style={styles.billingRow}>
                <span>Sales Tax</span>
                <span>$0.00 USD</span>
              </div>
              <div style={{ ...styles.billingRow, fontWeight: 'bold', borderTop: '1px solid #091e4224', paddingTop: '12px' }}>
                <span>Total</span>
                <span>$119.99 USD</span>
              </div>
            </div>
          </div>
        );
      /* ── Personal Settings views ── */
      case '/settings/profile':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Profile and Visibility</h2>
            <p style={styles.descriptionText}>
              Manage your personal profile information. Changes here are visible to other Trello users.
            </p>

            <div style={styles.settingBlock}>
              <div style={{ ...styles.memberAvatar, width: '72px', height: '72px', fontSize: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff78cb, #c377e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>U</div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#fff' }}>User</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9fadbc' }}>@user123</p>
                <button style={{ ...styles.actionButton, marginTop: '12px', fontSize: '13px', padding: '6px 14px' }} onClick={() => showToast('Upload photo dialog opened')}>
                  Change photo
                </button>
              </div>
            </div>

            <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              {[
                { label: 'Full name', value: 'User', placeholder: 'Enter your name' },
                { label: 'Username', value: 'user123', placeholder: 'Choose a username' },
                { label: 'Bio', value: '', placeholder: 'Tell your teammates a bit about yourself' },
              ].map(({ label, value, placeholder }) => (
                <div key={label}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9fadbc', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <input
                    defaultValue={value}
                    placeholder={placeholder}
                    style={styles.inputField}
                    onBlur={(e) => showToast(`${label} saved: "${e.target.value}"`)}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#9fadbc', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Profile visibility</div>
                <select style={styles.inputField} onChange={(e) => showToast(`Visibility set to: ${e.target.value}`)}>
                  <option value="public">Public — visible to all Trello users</option>
                  <option value="workspace">Workspace members only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <button style={styles.actionButton} onClick={() => showToast('Profile saved successfully!')}>
                Save profile
              </button>
            </div>
          </div>
        );

      case '/settings/activity':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Activity</h2>
            <p style={styles.descriptionText}>
              A log of your recent actions across all boards and workspaces.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '16px' }}>
              {[
                { icon: '📋', action: 'added a card', detail: '"Sprint planning" to To Do', board: 'Engineering Board', time: '2 minutes ago' },
                { icon: '✅', action: 'completed checklist item', detail: '"Write unit tests"', board: 'My Tasks | Trello', time: '1 hour ago' },
                { icon: '💬', action: 'commented on', detail: '"Deploy to staging"', board: 'Engineering Board', time: '3 hours ago' },
                { icon: '🏷️', action: 'added label', detail: 'Urgent to "Fix login bug"', board: 'Engineering Board', time: 'Yesterday at 5:30 PM' },
                { icon: '🗂️', action: 'moved card', detail: '"Design review" to Done', board: 'Design Sprint', time: 'Yesterday at 2:00 PM' },
                { icon: '👤', action: 'joined board', detail: 'New Hire Onboarding', board: 'New Hire Onboarding', time: '3 days ago' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid hsla(0,0%,100%,0.06)', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff78cb, #c377e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#b6c2cf' }}>
                      You <strong style={{ color: '#fff' }}>{item.action}</strong> {item.detail}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9fadbc', marginTop: '3px' }}>
                      in <span style={{ color: '#579dff', cursor: 'pointer' }} onClick={() => showToast(`Opening board: ${item.board}`)}>{item.board}</span> · {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '/settings/cards':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Cards</h2>
            <p style={styles.descriptionText}>
              All cards assigned to you across every board and workspace.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {[
                { title: 'Fix login bug', list: 'In Progress', board: 'Engineering Board', due: 'Due today', dueColor: '#f87168' },
                { title: 'Write unit tests', list: 'To Do', board: 'Engineering Board', due: 'Due tomorrow', dueColor: '#fea362' },
                { title: 'Content Calendar Q3', list: 'Planning', board: 'Marketing Board', due: 'Due Jun 2', dueColor: '#b6c2cf' },
                { title: 'Onboarding checklist review', list: 'Review', board: 'New Hire Onboarding', due: 'No due date', dueColor: '#9fadbc' },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{ background: '#22272b', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid hsla(0,0%,100%,0.08)', transition: 'border-color 0.2s' }}
                  onClick={() => showToast(`Opening card: ${card.title}`)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#579dff'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsla(0,0%,100%,0.08)'}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{card.title}</div>
                    <div style={{ fontSize: '12px', color: '#9fadbc' }}>{card.list} · <span style={{ color: '#579dff' }}>{card.board}</span></div>
                  </div>
                  <div style={{ fontSize: '12px', color: card.dueColor, fontWeight: 500 }}>{card.due}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case '/settings/account':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Account Settings</h2>
            <p style={styles.descriptionText}>Manage your login credentials and account preferences.</p>

            {[
              { title: 'Email address', value: 'user123@example.com', action: 'Change email' },
              { title: 'Password', value: '••••••••', action: 'Change password' },
              { title: 'Two-factor authentication', value: 'Not enabled', action: 'Enable 2FA' },
            ].map(({ title, value, action }) => (
              <div key={title} style={{ ...styles.settingBlock, flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: '#9fadbc', marginTop: '2px' }}>{value}</div>
                  </div>
                  <button style={{ ...styles.actionButton, fontSize: '13px', padding: '6px 14px' }} onClick={() => showToast(`${action} dialog opened`)}>
                    {action}
                  </button>
                </div>
                <div style={{ height: '1px', background: 'hsla(0,0%,100%,0.06)' }} />
              </div>
            ))}

            <h3 style={{ ...styles.settingSectionTitle, marginTop: '32px' }}>Language & Region</h3>
            <select style={{ ...styles.inputField, maxWidth: '320px' }} onChange={(e) => showToast(`Language changed to: ${e.target.value}`)}>
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Français</option>
              <option>Español</option>
              <option>Deutsch</option>
            </select>

            <h3 style={{ ...styles.settingSectionTitle, marginTop: '32px', color: '#ef5c48' }}>Danger Zone</h3>
            <button
              style={{ ...styles.actionButton, background: 'transparent', border: '1px solid #ef5c48', color: '#ef5c48' }}
              onClick={() => showToast('Account deletion requires contacting support.')}
            >
              Delete Account
            </button>
          </div>
        );

      case '/settings/labs':
        return (
          <div style={styles.contentArea}>
            <h2 style={styles.pageTitle}>Labs</h2>
            <p style={styles.descriptionText}>
              Experimental features that are not yet available to everyone. These may change or be removed at any time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              {[
                { name: 'AI card suggestions', desc: 'Let AI suggest card titles and checklists as you type.', enabled: true },
                { name: 'New card editor', desc: 'Try the redesigned card creation experience with inline editing.', enabled: false },
                { name: 'Timeline density mode', desc: 'Show more items on the Timeline view by reducing card height.', enabled: false },
                { name: 'Keyboard shortcut overlay', desc: 'Press ? at any time to see an overlay of all available shortcuts.', enabled: true },
              ].map((feature) => {
                // Local toggle state per feature — use data attribute trick for simplicity
                return (
                  <div
                    key={feature.name}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#22272b', borderRadius: '12px', padding: '16px 20px', border: '1px solid hsla(0,0%,100%,0.08)' }}
                  >
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{feature.name}</div>
                      <div style={{ fontSize: '13px', color: '#9fadbc' }}>{feature.desc}</div>
                    </div>
                    <button
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: feature.enabled ? '#4bce97' : '#344563', position: 'relative', flexShrink: 0,
                        transition: 'background 0.2s',
                      }}
                      onClick={() => showToast(`${feature.name} toggled`)}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px', left: feature.enabled ? '23px' : '3px',
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return <div style={styles.contentArea}>Page not found.</div>;
    }
  };

  return (
    <div style={styles.container}>
      {renderSidebar()}
      {renderContent()}
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#4bce97', color: '#1d2125', padding: '12px 24px',
          borderRadius: '24px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000, transition: 'opacity 0.3s'
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: '#1d2125',
    color: '#b6c2cf',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    borderRight: '1px solid hsla(0,0%,100%,0.16)',
    overflowY: 'auto',
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sidebarSectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9fadbc',
    padding: '0 12px',
    marginBottom: '8px',
  },
  sidebarNavItem: {
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#b6c2cf',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarNavItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#579dff',
    fontWeight: '600',
  },
  sidebarWsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    marginBottom: '8px',
  },
  wsMiniIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #4bce97, #216e4e)',
    color: '#1d2125',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  premiumBadge: {
    fontSize: '11px',
    backgroundColor: '#282e33',
    border: '1px solid #738496',
    padding: '2px 8px',
    borderRadius: '12px',
    marginLeft: '8px',
  },
  premiumBadgeLabel: {
    fontSize: '12px',
    backgroundColor: '#f5cd47',
    color: '#1d2125',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '600',
  },
  privateBadge: {
    fontSize: '12px',
    backgroundColor: '#282e33',
    color: '#b6c2cf',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  contentArea: {
    flexGrow: 1,
    padding: '40px 60px',
    overflowY: 'auto',
    maxWidth: '800px',
  },
  pageTitle: {
    margin: '0 0 24px 0',
    fontSize: '24px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
  },
  membersTabs: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid hsla(0,0%,100%,0.16)',
    marginBottom: '24px',
  },
  membersTab: {
    padding: '8px 0',
    cursor: 'pointer',
    color: '#9fadbc',
    fontSize: '14px',
    fontWeight: '500',
  },
  membersTabActive: {
    padding: '8px 0',
    cursor: 'pointer',
    color: '#579dff',
    fontSize: '14px',
    fontWeight: '600',
    borderBottom: '2px solid #579dff',
  },
  descriptionText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#b6c2cf',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#282e33',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid hsla(0,0%,100%,0.08)',
    gap: '16px',
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#579dff',
    color: '#1d2125',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  memberDetails: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  memberName: {
    fontSize: '16px',
    color: '#fff',
    fontWeight: '500',
  },
  memberActivity: {
    fontSize: '12px',
    color: '#9fadbc',
  },
  settingBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  wsMiniIconLarge: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4bce97, #216e4e)',
    color: '#1d2125',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '24px',
  },
  aiBlock: {
    backgroundColor: 'rgba(245, 205, 71, 0.1)',
    border: '1px solid #f5cd47',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '32px',
  },
  linkText: {
    color: '#579dff',
    textDecoration: 'underline',
    fontSize: '14px',
  },
  settingSectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    color: '#fff',
  },
  restrictionList: {
    margin: '0 0 24px 0',
    paddingLeft: '24px',
    color: '#b6c2cf',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  actionButton: {
    backgroundColor: '#282e33',
    color: '#b6c2cf',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  billingFeaturesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px',
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trialBanner: {
    backgroundColor: '#282e33',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontWeight: 'bold',
    color: '#fff',
    borderLeft: '6px solid #f5cd47',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  planSelection: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
  },
  planCard: {
    flex: 1,
    padding: '24px',
    backgroundColor: '#282e33',
    borderRadius: '16px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  planCardActive: {
    flex: 1,
    padding: '24px',
    backgroundColor: '#282e33',
    borderRadius: '16px',
    border: '2px solid #579dff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(87,157,255,0.1)',
  },
  planPrice: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    margin: '8px 0',
  },
  planSub: {
    fontSize: '12px',
    color: '#9fadbc',
  },
  paymentSection: {
    marginBottom: '32px',
  },
  inputField: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#22272b',
    border: '1px solid #738496',
    borderRadius: '12px',
    color: '#b6c2cf',
    outline: 'none',
  },
  billingSummary: {
    backgroundColor: '#282e33',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  billingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    color: '#b6c2cf',
    fontSize: '14px',
  }
};

export default WorkspacePage;
