import React from 'react';

const VisibilityMenu = ({ showMenu, setShowMenu, currentVisibility, setVisibility }) => {
  if (!showMenu) return null;

  const options = [
    {
      id: 'Private',
      icon: '🔒',
      title: 'Private',
      desc: 'Only board members can see this template. Workspace admins can close the board or remove members.'
    },
    {
      id: 'Workspace',
      icon: '👥',
      title: 'Workspace',
      desc: 'All members of the Workspace can see this template. Only board admins can edit.'
    },
    {
      id: 'Organization',
      icon: '🏢',
      title: 'Organization',
      desc: 'All members of the organization can see this template. The board must be added to an enterprise Workspace to enable this.'
    },
    {
      id: 'Public',
      icon: '🌐',
      title: 'Public',
      desc: 'Anyone on the internet can see this template. Only board admins can edit.'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: '0',
      marginTop: '8px',
      backgroundColor: '#282e33',
      borderRadius: '8px',
      boxShadow: '0 8px 16px -4px rgba(0,0,0,0.5), 0 0 0 1px hsla(0,0%,100%,0.08)',
      width: '320px',
      zIndex: 100,
      color: '#b6c2cf',
      padding: '12px 0'
    }}>
      <div style={{ padding: '0 12px 12px', borderBottom: '1px solid hsla(0,0%,100%,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '16px' }}></div>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>Change visibility</span>
        <button 
          onClick={() => setShowMenu(false)}
          style={{ background: 'none', border: 'none', color: '#9fadbc', cursor: 'pointer', padding: '4px', display: 'flex' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
        {options.map(opt => (
          <div 
            key={opt.id}
            onClick={() => { setVisibility(opt.id); setShowMenu(false); }}
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer',
              display: 'flex',
              gap: '12px',
              backgroundColor: currentVisibility === opt.id ? 'hsla(0,0%,100%,0.08)' : 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsla(0,0%,100%,0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentVisibility === opt.id ? 'hsla(0,0%,100%,0.08)' : 'transparent'}
          >
            <div style={{ fontSize: '16px', color: currentVisibility === opt.id ? '#579dff' : '#9fadbc', marginTop: '2px' }}>{opt.icon}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: currentVisibility === opt.id ? '#579dff' : '#b6c2cf' }}>
                {opt.title}
              </div>
              <div style={{ fontSize: '12px', color: '#9fadbc', lineHeight: '1.4' }}>
                {opt.desc}
              </div>
            </div>
            <div style={{ width: '16px', color: '#579dff' }}>
              {currentVisibility === opt.id && '✓'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisibilityMenu;
