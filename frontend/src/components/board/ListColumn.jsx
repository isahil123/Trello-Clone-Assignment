import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import apiClient from '../../api/client';
import CardItem from './CardItem';
import { useBoard } from '../../context/BoardContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LIST_COLORS = [
  '#42285a', // Purple
  '#6b5a1b', // Olive/Yellow
  '#1b5a3b', // Green
  '#22272b', // Dark Gray
];

const ListColumn = ({ list, dragHandleProps, onCardClick, index }) => {
  const { handleCardAdded, setLists, lists } = useBoard();
  const navigate = useNavigate();
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingCard, setAddingCard] = useState(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  
  const [isAddCardHovered, setIsAddCardHovered] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const cards = list.cards || [];
  const menuRef = useRef(null);
  const templateRef = useRef(null);

  // Use dynamic list color
  const listColor = LIST_COLORS[index % LIST_COLORS.length];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (templateRef.current && !templateRef.current.contains(event.target)) {
        setShowTemplateMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { capture: true });
    return () => document.removeEventListener('mousedown', handleClickOutside, { capture: true });
  }, []);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      setAddingCard(true);
      const nextPosition =
        cards.length > 0 ? cards[cards.length - 1].position + 1000 : 1000;

      const response = await apiClient.post('/cards', {
        title: newCardTitle.trim(),
        listId: list.id,
        position: nextPosition,
      });

      const createdCard = response.data.data;
      handleCardAdded(list.id, createdCard);
      setNewCardTitle('');
      setShowAddCard(false);
    } catch (err) {
      console.error('Failed to add card:', err);
      alert('Could not add card. Please try again.');
    } finally {
      setAddingCard(false);
    }
  };

  const handleCancelAddCard = () => {
    setShowAddCard(false);
    setNewCardTitle('');
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle.trim() === list.title) {
      setIsEditingTitle(false);
      setEditTitle(list.title);
      return;
    }
    const previousTitle = list.title;
    // Optimistic update
    setLists((prev) => prev.map(l => l.id === list.id ? { ...l, title: editTitle.trim() } : l));
    setIsEditingTitle(false);
    
    try {
      await apiClient.patch(`/lists/${list.id}`, { title: editTitle.trim() });
    } catch (err) {
      console.error('Failed to update list title', err);
      // Revert on failure
      setLists((prev) => prev.map(l => l.id === list.id ? { ...l, title: previousTitle } : l));
      toast.error('Failed to update title. Database offline.');
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm(`Are you sure you want to delete list "${list.title}"?`)) {
      const previousLists = [...lists];
      // Optimistic delete
      setLists((prev) => prev.filter(l => l.id !== list.id));
      setShowMenu(false);
      
      try {
        await apiClient.delete(`/lists/${list.id}`);
        toast.success('List deleted');
      } catch (err) {
        console.error('Failed to delete list', err);
        setLists(previousLists);
        toast.error('Failed to delete list. Changes reverted.');
      }
    } else {
      setShowMenu(false);
    }
  };

  return (
    <div style={{ ...styles.column, backgroundColor: listColor }}>
      <div style={styles.header} {...dragHandleProps}>
        {isEditingTitle ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            style={styles.titleInput}
          />
        ) : (
          <h3 style={styles.title} onClick={() => setIsEditingTitle(true)}>
            {list.title}
          </h3>
        )}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button style={styles.menuButton} onClick={() => setShowMenu(!showMenu)}>
            •••
          </button>
          {showMenu && (
            <div style={styles.menuDropdown}>
              <div style={styles.menuHeader}>
                <span style={styles.menuTitle}>List actions</span>
                <button style={styles.menuClose} onClick={() => setShowMenu(false)}>✕</button>
              </div>
              <div style={styles.menuBody}>
                <button style={styles.menuItem} onClick={handleDeleteList}>
                  Archive this list
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Droppable droppableId={list.id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...styles.cardContainer,
              backgroundColor: snapshot.isDraggingOver
                ? 'rgba(255,255,255,0.04)'
                : 'transparent',
              transition: 'background-color 0.15s ease',
            }}
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <CardItem
                    card={card}
                    innerRef={provided.innerRef}
                    draggableProps={provided.draggableProps}
                    dragHandleProps={provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                    onClick={() => onCardClick(card.id)}
                  />
                )}
              </Draggable>
            ))}

            {provided.placeholder}

            {addingCard && (
              <div style={{...styles.cardContainer, padding: '4px 0', minHeight: '0'}}>
                <div className="shimmer shimmer-card" style={{margin: '0 4px', height: '64px'}}></div>
              </div>
            )}

            {showAddCard && (
              <form onSubmit={handleAddCard} style={styles.addCardForm}>
                <textarea
                  autoFocus
                  rows={2}
                  placeholder="Enter a title for this card..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard(e);
                    }
                  }}
                  style={styles.textarea}
                />
                <div style={styles.formActions}>
                  <button
                    type="submit"
                    disabled={addingCard}
                    style={styles.submitButton}
                  >
                    {addingCard ? 'Adding...' : 'Add card'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddCard}
                    style={styles.cancelButton}
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Droppable>

      {!showAddCard && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          <button
            onClick={() => setShowAddCard(true)}
            onMouseEnter={() => setIsAddCardHovered(true)}
            onMouseLeave={() => setIsAddCardHovered(false)}
            style={{
              ...styles.addCardButton,
              backgroundColor: isAddCardHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              flexGrow: 1
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Add a card
          </button>
          <div style={{ position: 'relative' }} ref={templateRef}>
            <button 
              style={{ ...styles.templateButton, backgroundColor: isAddCardHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }} 
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              title="Create from template"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8m-4-4h8" />
              </svg>
            </button>
            {showTemplateMenu && (
              <div style={styles.templateDropdown}>
                <div style={styles.templateHeader}>
                  <span style={styles.templateTitle}>Card templates</span>
                  <button style={styles.templateClose} onClick={() => setShowTemplateMenu(false)}>✕</button>
                </div>
                <div style={styles.templateBody}>
                  <p style={{ fontSize: '14px', color: '#b6c2cf', textAlign: 'center', marginBottom: '16px' }}>
                    You don't have any templates. Create a template to make copying cards easy.
                  </p>
                  <button 
                    style={styles.createTemplateBtn}
                    onClick={() => { setShowTemplateMenu(false); navigate('/templates'); }}
                  >
                    Create a new template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  column: {
    backgroundColor: '#101204',
    borderRadius: '12px',
    width: '272px',
    minWidth: '272px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 120px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '8px 8px 12px 8px',
    cursor: 'grab',
  },
  title: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#b6c2cf',
    cursor: 'pointer',
    userSelect: 'none',
    wordBreak: 'break-word',
    flexGrow: 1,
  },
  titleInput: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#b6c2cf',
    backgroundColor: '#22272b',
    border: '2px solid #579dff',
    borderRadius: '3px',
    padding: '2px 6px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#9fadbc',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '3px',
    lineHeight: 1,
    transition: 'background-color 0.1s',
  },
  menuDropdown: {
    position: 'absolute',
    top: '32px',
    left: '100%',
    backgroundColor: '#282e33',
    borderRadius: '3px',
    boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)',
    width: '304px',
    zIndex: 10,
  },
  menuHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderBottom: '1px solid hsla(0,0%,100%,0.16)',
  },
  menuTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#9fadbc',
    flexGrow: 1,
    textAlign: 'center',
  },
  menuClose: {
    background: 'none',
    border: 'none',
    color: '#9fadbc',
    cursor: 'pointer',
    padding: '4px',
  },
  menuBody: {
    padding: '8px 0',
  },
  menuItem: {
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    color: '#b6c2cf',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cardContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    minHeight: '2px',
    padding: '0 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderRadius: '8px',
  },
  addCardButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9fadbc',
    textAlign: 'left',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.1s',
  },
  templateButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9fadbc',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.1s',
  },
  templateDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '8px',
    backgroundColor: '#282e33',
    borderRadius: '8px',
    boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)',
    width: '304px',
    zIndex: 200,
  },
  templateHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderBottom: '1px solid hsla(0,0%,100%,0.16)',
  },
  templateTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#9fadbc',
    flexGrow: 1,
    textAlign: 'center',
  },
  templateClose: {
    background: 'none',
    border: 'none',
    color: '#9fadbc',
    cursor: 'pointer',
    padding: '4px',
  },
  templateBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  createTemplateBtn: {
    backgroundColor: '#579dff',
    color: '#1d2125',
    border: 'none',
    borderRadius: '3px',
    padding: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  addCardForm: {
    marginTop: '8px',
    padding: '0 4px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#22272b',
    color: '#b6c2cf',
    fontSize: '14px',
    resize: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '8px',
    boxShadow: 'inset 0 0 0 2px #579dff',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitButton: {
    backgroundColor: '#579dff',
    color: '#1d2125',
    border: 'none',
    borderRadius: '3px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  cancelButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#9fadbc',
    lineHeight: 1,
  },
};

export default ListColumn;
