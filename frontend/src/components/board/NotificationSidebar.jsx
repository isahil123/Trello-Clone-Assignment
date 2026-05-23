import React from 'react';
import useBoardStore from '../../store/useBoardStore';

const formatDistanceToNow = (date) => {
  const diff = date - new Date();
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  return 'less than an hour';
};

const isPast = (date) => date < new Date();

const NotificationSidebar = ({ board }) => {
  const { sidebarOpen, setSidebarOpen, setActiveCardId } = useBoardStore();

  if (!sidebarOpen || !board) return null;

  // Find cards with due dates
  const cardsWithDates = [];
  board.lists.forEach(list => {
    list.cards.forEach(card => {
      if (card.dueDate && !card.isCompleted) {
        cardsWithDates.push({ ...card, listTitle: list.title });
      }
    });
  });

  // Sort by date (closest first)
  cardsWithDates.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="notification-sidebar">
      <div className="notification-header">
        <h2>Notifications</h2>
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>✕</button>
      </div>
      <div className="notification-content">
        {cardsWithDates.length === 0 ? (
          <div className="empty-notifications">
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🎉</span>
            No pending tasks with due dates!
          </div>
        ) : (
          <div className="notification-list">
            {cardsWithDates.map(card => {
              const isOverdue = isPast(new Date(card.dueDate));
              return (
                <div 
                  key={card.id} 
                  className={`notification-item ${isOverdue ? 'overdue' : ''}`}
                  onClick={() => {
                    setActiveCardId(card.id);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="notification-icon">
                    {isOverdue ? '⚠️' : '🕒'}
                  </div>
                  <div className="notification-details">
                    <div className="notification-title">{card.title}</div>
                    <div className="notification-meta">
                      In list: {card.listTitle}
                    </div>
                    <div className={`notification-time ${isOverdue ? 'danger-text' : 'warning-text'}`}>
                      {isOverdue ? 'Overdue by ' : 'Due in '}
                      {formatDistanceToNow(new Date(card.dueDate))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSidebar;
