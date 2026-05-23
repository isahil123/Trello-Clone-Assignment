import React, { useState } from 'react';

const LABEL_COLOR_MAP = {
  RED: '#f87168',
  BLUE: '#579dff',
  GREEN: '#4bce97',
  YELLOW: '#f5cd47',
  PURPLE: '#9f8fef',
  ORANGE: '#fea362',
  SKY: '#6cc3e0',
  PINK: '#e774bb',
  BLACK: '#8c9bab',
};

const CardItem = ({ card, innerRef, draggableProps, dragHandleProps, isDragging, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        ...styles.card,
        ...draggableProps?.style,
        outline: isHovered ? '2px solid #579dff' : '1px solid transparent',
        boxShadow: isDragging
          ? '0 8px 16px rgba(0,0,0,0.4)'
          : (isHovered ? '0 2px 4px rgba(0,0,0,0.2)' : '0 1px 1px rgba(0,0,0,0.1)'),
        transform: isHovered && !isDragging ? 'translateY(-2px)' : 'none',
        zIndex: isDragging ? 100 : 1,
      }}
    >
      {card.labels && card.labels.length > 0 && (
        <div style={styles.labels}>
          {card.labels.map((cardLabel) => {
            const colorKey = cardLabel.label?.color;
            const bgColor = LABEL_COLOR_MAP[colorKey] || '#b3bac5';
            return (
              <span
                key={cardLabel.id}
                style={{ ...styles.label, backgroundColor: bgColor }}
                title={cardLabel.label?.title || ''}
              />
            );
          })}
        </div>
      )}
      
      <h4 style={styles.title}>{card.title}</h4>
      
      <div style={styles.footer}>
        <div style={styles.badges}>
          {card.description && <span style={styles.badgeIcon}>≡</span>}
          {card.comments && card.comments.length > 0 && <span style={styles.badgeIcon}>💬 {card.comments.length}</span>}
          {card.dueDate && (
            <span style={{...styles.badgeIcon, ...styles.dueDateBadge}}>
              🕒 {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {card.checklists && card.checklists.length > 0 && (() => {
            const totalItems = card.checklists.reduce((acc, c) => acc + (c.items ? c.items.length : 0), 0);
            const completedItems = card.checklists.reduce((acc, c) => acc + (c.items ? c.items.filter(i => i.isCompleted).length : 0), 0);
            return totalItems > 0 ? (
              <span style={{...styles.badgeIcon, backgroundColor: totalItems === completedItems ? '#1f845a' : 'transparent', color: totalItems === completedItems ? '#ffffff' : '#9fadbc', padding: totalItems === completedItems ? '0 4px' : '0', borderRadius: '3px'}}>
                ☑ {completedItems}/{totalItems}
              </span>
            ) : null;
          })()}
        </div>
        {card.members && card.members.length > 0 && (
          <div style={styles.members}>
            {card.members.map(member => {
              const name = member.user?.name || member.name || 'User';
              const initial = name.charAt(0).toUpperCase();
              return (
                <div key={member.id} style={{
                  ...styles.memberAvatar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1d2125',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {initial}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#2c333a',
    borderRadius: '8px',
    padding: '8px 12px 4px',
    marginBottom: '8px',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '20px',
    wordWrap: 'break-word',
    transition: 'outline 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '400',
    color: 'var(--ds-text, #b6c2cf)',
    lineHeight: '20px',
  },
  labels: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  label: {
    width: '40px',
    height: '8px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    minHeight: '16px',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    color: '#9fadbc',
    fontSize: '12px',
  },
  badgeIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  dueDateBadge: {
    backgroundColor: '#282e33',
    padding: '0 4px',
    borderRadius: '3px',
  },
  members: {
    display: 'flex',
    gap: '-4px',
  },
  memberAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#579dff',
    border: '2px solid #22272b',
  }
};

export default CardItem;
