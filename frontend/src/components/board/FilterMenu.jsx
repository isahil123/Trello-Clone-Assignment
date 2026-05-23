import React from 'react';

const LABEL_COLOR_MAP = {
  RED: '#f87168', BLUE: '#579dff', GREEN: '#4bce97', YELLOW: '#f5cd47',
  PURPLE: '#9f8fef', ORANGE: '#fea362', SKY: '#6cc3e0', PINK: '#e774bb', BLACK: '#8c9bab',
};

const FilterDrawer = ({
  showFilterMenu,
  setShowFilterMenu,
  filterKeyword,
  setFilterKeyword,
  filterLabelColors,
  toggleLabelFilter,
  filterMemberIds,
  toggleMemberFilter,
  filterDueDate,
  setFilterDueDate,
  boardMembers
}) => {
  if (!showFilterMenu) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '48px',
      right: 0,
      bottom: 0,
      width: '340px',
      backgroundColor: '#282e33',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      color: '#b6c2cf'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid hsla(0,0%,100%,0.16)' }}>
        <div style={{ flexGrow: 1, textAlign: 'center', fontWeight: '600', color: '#9fadbc' }}>Filter</div>
        <button 
          onClick={() => setShowFilterMenu(false)}
          style={{ background: 'none', border: 'none', color: '#9fadbc', cursor: 'pointer', fontSize: '16px' }}
        >✕</button>
      </div>

      <div style={{ padding: '16px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Keyword Section */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Keyword</label>
          <input 
            type="text" 
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="Enter a keyword..." 
            style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '2px solid #579dff', backgroundColor: '#22272b', color: '#b6c2cf', boxSizing: 'border-box', outline: 'none' }}
          />
          <p style={{ fontSize: '11px', color: '#9fadbc', marginTop: '4px' }}>Search cards, members, labels, and more.</p>
        </div>

        {/* Members Section */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Members</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#22272b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
              <span>No members</span>
            </label>
            {boardMembers?.map(m => (
              <label key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={filterMemberIds.includes(m.userId)} 
                  onChange={() => toggleMemberFilter(m.userId)} 
                  style={{ width: '16px', height: '16px', accentColor: '#579dff' }}
                />
                <img src={m.user?.avatarUrl || `https://ui-avatars.com/api/?name=${m.user?.name}&background=random`} alt={m.user?.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                <span>{m.user?.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Card Status Section */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Card status</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span>Marked as complete</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span>Not marked as complete</span>
            </label>
          </div>
        </div>

        {/* Due Date Section */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Due date</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span style={{ color: '#9fadbc' }}>📅</span>
              <span>No dates</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span style={{ backgroundColor: '#f87168', borderRadius: '3px', width: '16px', height: '16px', display: 'inline-block' }}></span>
              <span>Overdue</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span style={{ backgroundColor: '#f5cd47', borderRadius: '3px', width: '16px', height: '16px', display: 'inline-block' }}></span>
              <span>Due in the next day</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span style={{ color: '#9fadbc' }}>⏱</span>
              <span>Due in the next week</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#579dff' }} />
              <span style={{ color: '#9fadbc' }}>⏱</span>
              <span>Due in the next month</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={filterDueDate} 
                onChange={(e) => setFilterDueDate(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: '#579dff' }}
              />
              <span style={{ color: '#9fadbc' }}>✓</span>
              <span>Has due date</span>
            </label>
          </div>
        </div>
        
        {/* Labels Section */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Labels</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(LABEL_COLOR_MAP).map(([colorKey, colorHex]) => (
              <button 
                key={colorKey}
                onClick={() => toggleLabelFilter(colorKey)}
                style={{
                  width: '32px', height: '32px', borderRadius: '3px', border: 'none', cursor: 'pointer',
                  backgroundColor: colorHex,
                  opacity: filterLabelColors.includes(colorKey) ? 1 : 0.6,
                  boxShadow: filterLabelColors.includes(colorKey) ? '0 0 0 2px #fff inset' : 'none'
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterDrawer;
