import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';
import useBoardStore from '../../store/useBoardStore';

import LabelPicker from './card-modal/LabelPicker';
import DueDatePicker from './card-modal/DueDatePicker';
import CardItem from './CardItem';

const COVER_COLORS = [
  '#4bce97', // Green
  '#f5cd47', // Yellow
  '#fea362', // Orange
  '#f87168', // Red
  '#9f8fef', // Purple
  '#579dff', // Blue
  '#6cc3e0', // Sky
  '#e774bb', // Pink
  '#8c9bab', // Black
  '#22272b'  // Dark Gray
];

const QuickEditModal = ({ card, rect, listId, boardId, boardLabels, boardMembers, onClose }) => {
  const queryClient = useQueryClient();
  const { setActiveCardId } = useBoardStore();

  const [title, setTitle] = useState(card.title);
  const [showLabels, setShowLabels] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [showCover, setShowCover] = useState(false);
  
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleSave = async () => {
    if (title.trim() && title !== card.title) {
      try {
        await apiClient.patch(`/cards/${card.id}`, { title: title.trim() });
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      } catch (err) {
        toast.error('Failed to update card title');
      }
    }
    onClose();
  };

  const handleOpenCard = () => {
    onClose();
    setActiveCardId(card.id);
  };

  const handleArchive = async () => {
    try {
      await apiClient.patch(`/cards/${card.id}/archive`, { isArchived: true });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      onClose();
    } catch (err) {
      toast.error('Failed to archive card');
    }
  };

  const handleToggleLabel = async (labelId, e) => {
    e.stopPropagation();
    try {
      const hasLabel = card.labels?.some(l => l.labelId === labelId);
      if (hasLabel) {
        await apiClient.delete(`/cards/${card.id}/labels/${labelId}`);
      } else {
        await apiClient.post(`/cards/${card.id}/labels`, { labelId });
      }
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    } catch (err) {
      toast.error('Failed to toggle label');
    }
  };

  const handleSaveDueDate = async (e, date) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/cards/${card.id}`, { dueDate: date ? new Date(date).toISOString() : null });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setShowDates(false);
    } catch (err) {
      toast.error('Failed to update due date');
    }
  };

  const handleRemoveDueDate = async (e) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/cards/${card.id}`, { dueDate: null });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setShowDates(false);
    } catch (err) {
      toast.error('Failed to remove due date');
    }
  };

  const handleSaveCover = async (color, imageUrl) => {
    try {
      await apiClient.patch(`/cards/${card.id}`, { 
        coverColor: color || null,
        coverImage: imageUrl || null
      });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setShowCover(false);
    } catch (err) {
      toast.error('Failed to update cover');
    }
  };

  // Prevent closing when clicking inside popovers
  const handleModalClick = (e) => {
    if (e.target.closest('.card-modal-popover') || e.target.closest('.quick-edit-menu')) {
      return;
    }
    handleSave();
  };

  // Adjust position to stay on screen
  const menuLeft = rect.left + rect.width + 8;
  const showMenuOnLeft = menuLeft + 150 > window.innerWidth;
  const menuStyle = {
    position: 'absolute',
    top: rect.top,
    left: showMenuOnLeft ? rect.left - 158 : menuLeft,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  return (
    <div 
      className="quick-edit-overlay" 
      onClick={handleModalClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9998,
      }}
    >
      <div 
        className="quick-edit-container"
        style={{
          position: 'absolute',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          zIndex: 9999
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ backgroundColor: '#22272b', borderRadius: '8px', padding: '0', display: 'flex', flexDirection: 'column' }}>
          {card.coverImage ? (
            <div style={{ height: '140px', backgroundImage: `url(${card.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} />
          ) : card.coverColor && (
            <div style={{ height: '32px', backgroundColor: card.coverColor, width: '100%', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} />
          )}
          
          <div style={{ padding: '8px 12px' }}>
            {card.labels && card.labels.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {card.labels.map((cardLabel) => (
                  <span
                    key={cardLabel.id}
                    style={{ width: '40px', height: '8px', borderRadius: '4px', backgroundColor: cardLabel.label?.color ? `#${cardLabel.label.color}` : '#b3bac5', display: 'inline-block' }}
                  />
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#b6c2cf',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                overflow: 'hidden',
                lineHeight: '20px',
                minHeight: '60px'
              }}
            />
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          style={{
            marginTop: '12px',
            backgroundColor: '#579dff',
            color: '#1d2125',
            border: 'none',
            borderRadius: '3px',
            padding: '8px 24px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Save
        </button>
      </div>

      <div className="quick-edit-menu" style={menuStyle}>
        <div style={{ position: 'relative' }}>
          <button className="quick-edit-btn" onClick={(e) => { e.stopPropagation(); setShowLabels(!showLabels); setShowDates(false); setShowCover(false); }}>
            <span className="icon">🏷️</span> Urgency
          </button>
          {showLabels && (
            <div style={{ position: 'absolute', top: 0, left: showMenuOnLeft ? '-350px' : '100%', marginLeft: '8px' }}>
              <LabelPicker 
                boardLabels={boardLabels} 
                cardLabelIds={(card.labels || []).map(l => l.labelId)}
                onToggleLabel={handleToggleLabel}
                onClose={() => setShowLabels(false)}
              />
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="quick-edit-btn" onClick={(e) => { e.stopPropagation(); setShowDates(!showDates); setShowLabels(false); setShowCover(false); }}>
            <span className="icon">🕒</span> Date
          </button>
          {showDates && (
            <div style={{ position: 'absolute', top: 0, left: showMenuOnLeft ? '-350px' : '100%', marginLeft: '8px' }}>
              <DueDatePicker 
                dueDate={card.dueDate ? card.dueDate.slice(0, 10) : ''}
                onSave={handleSaveDueDate}
                onRemove={handleRemoveDueDate}
                onClose={() => setShowDates(false)}
              />
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="quick-edit-btn" onClick={(e) => { e.stopPropagation(); setShowCover(!showCover); setShowLabels(false); setShowDates(false); }}>
            <span className="icon">🎨</span> Color
          </button>
          {showCover && (
            <div style={{ position: 'absolute', top: 0, left: showMenuOnLeft ? '-350px' : '100%', marginLeft: '8px' }}>
              <div className="card-modal-popover" onClick={(e) => e.stopPropagation()}>
                <div className="popover-header">
                  <h4>Card Color</h4>
                  <button className="popover-close" onClick={() => setShowCover(false)}>✕</button>
                </div>
                <div className="popover-body">
                  <div className="color-grid">
                    {COVER_COLORS.map(color => (
                      <button
                        key={color}
                        className={`color-box ${card.coverColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleSaveCover(color, null)}
                      />
                    ))}
                  </div>
                  <button 
                    className="remove-cover-btn"
                    onClick={() => handleSaveCover(null, null)}
                    style={{ marginTop: '8px' }}
                  >
                    Remove color
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .quick-edit-btn {
          background-color: rgba(0,0,0,0.6);
          color: #b6c2cf;
          border: none;
          border-radius: 3px;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .quick-edit-btn:hover {
          background-color: rgba(0,0,0,0.8);
          transform: translateX(4px);
          color: #fff;
        }
        .color-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .color-box {
          width: 100%;
          aspect-ratio: 1.5;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          position: relative;
        }
        .color-box:hover {
          opacity: 0.8;
        }
        .color-box.selected::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-weight: bold;
        }
        .remove-cover-btn {
          width: 100%;
          padding: 6px;
          background-color: #22272b;
          border: none;
          border-radius: 3px;
          color: #b6c2cf;
          cursor: pointer;
        }
        .remove-cover-btn:hover {
          background-color: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default QuickEditModal;
