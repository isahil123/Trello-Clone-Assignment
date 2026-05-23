import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';
import ListColumn from './ListColumn';
import CardModal from './CardModal';
import FilterDrawer from './FilterMenu';
import ViewsMenu from './ViewsMenu';
import TableView from './TableView';
import DashboardView from './DashboardView';
import CalendarView from './CalendarView';
import TimelineView from './TimelineView';
import PlaceholderView from './PlaceholderView';
import VisibilityMenu from './VisibilityMenu';
import { useBoard } from '../../context/BoardContext';
import './Board.css';

const recalcPositions = (items) =>
  items.map((item, index) => ({ ...item, position: (index + 1) * 1000 }));

const Board = ({ boardId, isSidebarOpen, setSidebarOpen, boards = [], onBoardUpdated }) => {
  const navigate = useNavigate();
  const { 
    board, 
    lists, 
    setLists, 
    loading, 
    error, 
    fetchBoard, 
    handleCardUpdate,
    currentView,
    setCurrentView
  } = useBoard();

  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [activeCardId, setActiveCardId] = useState(null);

  // Filter states
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterLabelColors, setFilterLabelColors] = useState([]);
  const [filterMemberIds, setFilterMemberIds] = useState([]);
  const [filterDueDate, setFilterDueDate] = useState(false);

  // Layout states
  const [showSwitchBoards, setShowSwitchBoards] = useState(false);
  const [switchBoardsSearchQuery, setSwitchBoardsSearchQuery] = useState('');

  // Star and Visibility states
  const [isStarred, setIsStarred] = useState(false);
  const [visibility, setVisibility] = useState('Workspace');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  useEffect(() => {
    // Reset search query when popover closes
    if (!showSwitchBoards) {
      setSwitchBoardsSearchQuery('');
    }
  }, [showSwitchBoards]);

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);

  useEffect(() => {
    if (board) {
      setIsStarred(board.isStarred || false);
      setVisibility(board.visibility || 'Workspace');
    }
  }, [board]);

  const toggleStar = async () => {
    const newStatus = !isStarred;
    setIsStarred(newStatus);
    try {
      const response = await apiClient.patch(`/boards/${boardId}`, { isStarred: newStatus });
      if (onBoardUpdated) onBoardUpdated(response.data.data);
    } catch (err) {
      setIsStarred(!newStatus);
      toast.error('Failed to update star status');
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    const oldVisibility = visibility;
    setVisibility(newVisibility);
    try {
      await apiClient.patch(`/boards/${boardId}`, { visibility: newVisibility });
      toast.success(`Board visibility set to ${newVisibility}`);
    } catch (err) {
      setVisibility(oldVisibility);
      toast.error('Failed to update visibility');
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const previousLists = JSON.parse(JSON.stringify(lists));

    if (type === 'LIST') {
      const reordered = Array.from(lists);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      const withNewPositions = recalcPositions(reordered);

      setLists(withNewPositions);

      apiClient
        .patch('/lists/reorder', {
          items: withNewPositions.map(({ id, position }) => ({ id, position })),
        })
        .catch((err) => {
          console.error('Failed to persist list reorder:', err);
          setLists(previousLists);
          toast.error('Failed to move list. Changes reverted.');
        });

      return;
    }

    const sourceList = lists.find((l) => l.id === source.droppableId);
    const destList = lists.find((l) => l.id === destination.droppableId);
    const sourceCards = Array.from(sourceList.cards);
    const [movedCard] = sourceCards.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCards.splice(destination.index, 0, movedCard);
      const withNewPositions = recalcPositions(sourceCards);

      setLists((prev) =>
        prev.map((l) =>
          l.id === sourceList.id ? { ...l, cards: withNewPositions } : l
        )
      );

      apiClient
        .patch('/cards/move', {
          items: withNewPositions.map(({ id, position, listId }) => ({
            id,
            position,
            listId,
          })),
        })
        .catch((err) => {
          console.error('Failed to persist card move:', err);
          setLists(previousLists);
          toast.error('Failed to move card. Changes reverted.');
        });
    } else {
      const movedCardInNewList = { ...movedCard, listId: destination.droppableId };
      const destCards = Array.from(destList.cards);
      destCards.splice(destination.index, 0, movedCardInNewList);

      const sourceWithPositions = recalcPositions(sourceCards);
      const destWithPositions = recalcPositions(destCards);

      setLists((prev) =>
        prev.map((l) => {
          if (l.id === sourceList.id) return { ...l, cards: sourceWithPositions };
          if (l.id === destList.id) return { ...l, cards: destWithPositions };
          return l;
        })
      );

      const allMovedItems = [
        ...sourceWithPositions.map(({ id, position, listId }) => ({ id, position, listId })),
        ...destWithPositions.map(({ id, position, listId }) => ({ id, position, listId })),
      ];

      apiClient
        .patch('/cards/move', { items: allMovedItems })
        .catch((err) => {
          console.error('Failed to persist cross-list card move:', err);
          setLists(previousLists);
          toast.error('Failed to move card. Changes reverted.');
        });
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      setAddingList(true);
      const nextPosition =
        lists.length > 0 ? lists[lists.length - 1].position + 1000 : 1000;
      const response = await apiClient.post('/lists', {
        title: newListTitle.trim(),
        boardId,
        position: nextPosition,
      });
      const createdList = response.data.data;
      setLists((prev) => [...prev, { ...createdList, cards: [] }]);
      setNewListTitle('');
      setShowAddList(false);
    } catch (err) {
      console.error('Failed to add list:', err);
      alert('Could not add list. Please try again.');
    } finally {
      setAddingList(false);
    }
  };

  const handleCardClick = (cardId) => {
    setActiveCardId(cardId);
  };

  const toggleLabelFilter = (color) => {
    setFilterLabelColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleMemberFilter = (memberId) => {
    setFilterMemberIds(prev => prev.includes(memberId) ? prev.filter(m => m !== memberId) : [...prev, memberId]);
  };

  const hasActiveFilters = filterKeyword || filterLabelColors.length > 0 || filterMemberIds.length > 0 || filterDueDate;

  let activeCard = null;
  let activeListTitle = '';
  if (activeCardId) {
    for (const list of lists) {
      const card = list.cards.find(c => c.id === activeCardId);
      if (card) {
        activeCard = card;
        activeListTitle = list.title;
        break;
      }
    }
  }

  const filteredListsData = lists.map(list => {
    const filteredCards = list.cards.filter(c => {
      if (filterKeyword && !c.title.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
      if (filterLabelColors.length > 0 && !c.labels?.some(l => filterLabelColors.includes(l.label?.color))) return false;
      if (filterMemberIds.length > 0 && !c.members?.some(m => filterMemberIds.includes(m.userId))) return false;
      if (filterDueDate && !c.dueDate) return false;
      return true;
    });
    return { ...list, cards: filteredCards };
  });

  if (loading) {
    return (
      <div className="board-page">
        <div className="shimmer-board-wrapper">
          <div className="shimmer shimmer-board-header"></div>
          <div className="shimmer-list-container">
            <div className="shimmer-list">
              <div className="shimmer shimmer-list-header"></div>
              <div className="shimmer shimmer-card"></div>
              <div className="shimmer shimmer-card"></div>
              <div className="shimmer shimmer-card"></div>
            </div>
            <div className="shimmer-list">
              <div className="shimmer shimmer-list-header"></div>
              <div className="shimmer shimmer-card"></div>
              <div className="shimmer shimmer-card"></div>
            </div>
            <div className="shimmer-list">
              <div className="shimmer shimmer-list-header"></div>
              <div className="shimmer shimmer-card"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="board-error">{error}</div>;
  if (!board) return <div className="board-message">No board found.</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', backgroundColor: 'transparent' }}>
      {/* Main Board Area with Curved Top Left */}
      <div style={{ 
        flexGrow: 1, 
        overflow: 'hidden', 
        background: 'linear-gradient(to bottom right, #664182, #b05c93)', 
        borderTopLeftRadius: isSidebarOpen ? '16px' : '0', 
        borderLeft: isSidebarOpen ? '1px solid hsla(0,0%,100%,0.16)' : 'none',
        borderTop: isSidebarOpen ? '1px solid hsla(0,0%,100%,0.16)' : 'none',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: isSidebarOpen ? '-4px 0 16px rgba(0,0,0,0.2)' : 'none',
      }}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
          <header className="board-header" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', backgroundColor: 'hsla(0,0%,0%,0.24)', color: '#fff', gap: '8px' }}>
        <h1 className="board-title" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, padding: '0 8px', lineHeight: '32px', cursor: 'pointer' }}>{board.title}</h1>
        
        <button 
          onClick={toggleStar}
          style={{
            background: 'none', border: 'none', color: isStarred ? '#f2d600' : '#fff', cursor: 'pointer',
            padding: '4px', display: 'flex', alignItems: 'center', transition: 'transform 0.1s',
            marginLeft: '4px', marginRight: '4px'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.8)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isStarred ? "#f2d600" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            style={{
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px',
              borderRadius: '3px', backgroundColor: showVisibilityMenu ? 'hsla(0,0%,100%,0.2)' : 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsla(0,0%,100%,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showVisibilityMenu ? 'hsla(0,0%,100%,0.2)' : 'transparent'}
          >
            {visibility === 'Private' ? '🔒' : visibility === 'Organization' ? '🏢' : visibility === 'Public' ? '🌐' : '👥'}
            <span style={{ fontSize: '14px' }}>{visibility}</span>
          </button>
          <VisibilityMenu 
            showMenu={showVisibilityMenu} 
            setShowMenu={setShowVisibilityMenu} 
            currentVisibility={visibility}
            setVisibility={handleVisibilityChange}
          />
        </div>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'hsla(0,0%,100%,0.24)', margin: '0 8px' }}></div>

        <div style={{ position: 'relative' }}>
          <button 
            className="views-button"
            style={{ 
              backgroundColor: '#fff', 
              color: '#172b4d', 
              border: 'none', 
              borderRadius: '3px', 
              padding: '6px 12px', 
              fontWeight: '500', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setShowViewsMenu(!showViewsMenu)}
          >
            <span style={{display: 'flex'}}>
              {currentView === 'Board' ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v5h3a.75.75 0 0 1 .75.75 1.75 1.75 0 1 0 3.5 0A.75.75 0 0 1 10.5 8h3V3a.5.5 0 0 0-.5-.5zm10.5 7h-2.337a3.251 3.251 0 0 1-6.326 0H2.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5zM12 6H4V4.5h8z" clipRule="evenodd" /></svg> :
               currentView === 'Table' ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v3.25H5V3.5zm4.5 0v3.75h8V4a.5.5 0 0 0-.5-.5zm8 5.25h-8v3.75H14a.5.5 0 0 0 .5-.5zM5 12.5V8.75H1.5V12a.5.5 0 0 0 .5.5z" clipRule="evenodd" /></svg> :
               currentView === 'Calendar' ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M4.5 2.5v2H6v-2h4v2h1.5v-2H13a.5.5 0 0 1 .5.5v3h-11V3a.5.5 0 0 1 .5-.5zm-2 5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.5zm9-6.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1.5V0H6v1h4V0h1.5z" clipRule="evenodd" /></svg> :
               currentView === 'Dashboard' ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v3.25H5V3.5zm4.5 0v3.75h8V4a.5.5 0 0 0-.5-.5zm8 5.25h-8v3.75H14a.5.5 0 0 0 .5-.5zM5 12.5V8.75H1.5V12a.5.5 0 0 0 .5.5z" clipRule="evenodd" /></svg> :
               currentView === 'Timeline' ? '☷' :
               currentView === 'Map' ? '📍' : <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v5h3a.75.75 0 0 1 .75.75 1.75 1.75 0 1 0 3.5 0A.75.75 0 0 1 10.5 8h3V3a.5.5 0 0 0-.5-.5zm10.5 7h-2.337a3.251 3.251 0 0 1-6.326 0H2.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5zM12 6H4V4.5h8z" clipRule="evenodd" /></svg>}
            </span> 
            <span>{currentView || 'Board'}</span>
            <span>⌄</span>
          </button>
          <ViewsMenu 
            showViewsMenu={showViewsMenu} 
            setShowViewsMenu={setShowViewsMenu} 
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <button className="share-button" style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dfe1e6', color: '#172b4d', border: 'none', fontWeight: 'bold' }}>S</button>
          <button className="share-button" style={{ backgroundColor: 'hsla(0,0%,100%,0.2)', color: '#fff', border: 'none', borderRadius: '3px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsla(0,0%,100%,0.3)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsla(0,0%,100%,0.2)'}>⚡ Automation</button>
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: hasActiveFilters ? '#1d2125' : '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              padding: '6px 12px',
              backgroundColor: hasActiveFilters ? '#579dff' : (showFilterMenu ? 'hsla(0,0%,100%,0.3)' : 'hsla(0,0%,100%,0.2)'),
              border: 'none',
              borderRadius: '3px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if(!hasActiveFilters) e.currentTarget.style.backgroundColor = 'hsla(0,0%,100%,0.3)'}}
            onMouseLeave={(e) => { if(!hasActiveFilters) e.currentTarget.style.backgroundColor = showFilterMenu ? 'hsla(0,0%,100%,0.3)' : 'hsla(0,0%,100%,0.2)'}}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 12v1.5H5V12zm2-4.75v1.5H3v-1.5zm2-4.75V4H1V2.5z"></path>
            </svg>
            Filter
          </button>
          <span className="header-divider" style={{ backgroundColor: 'hsla(0,0%,100%,0.24)', width: '1px', height: '16px', margin: '0 4px' }}></span>
          <button 
            className="share-button" 
            style={{ backgroundColor: '#dfe1e6', color: '#172b4d', border: 'none', borderRadius: '3px', padding: '6px 12px', fontWeight: '500', cursor: 'pointer' }}
            onClick={() => toast('Info: Feature out of scope for this assignment.', { icon: 'ℹ️' })}
          >
            Share
          </button>
        </div>
      </header>

      {currentView === 'Board' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="LIST">
            {(provided) => (
              <main
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="lists-container"
              >
                {filteredListsData.map((list, index) => {
                  return (
                    <ListColumn
                      key={list.id}
                      list={list}
                      index={index}
                      dragHandleProps={provided.dragHandleProps} 
                      onCardClick={handleCardClick}
                    />
                  );
                })}
                {provided.placeholder}

                <div className="add-list-wrapper">
                  {!showAddList ? (
                    <button
                      className="add-list-button"
                      onClick={() => setShowAddList(true)}
                    >
                      <span>+</span> Add another list
                    </button>
                  ) : (
                    <form onSubmit={handleAddList} className="add-list-form">
                      <input
                        autoFocus
                        type="text"
                        className="add-list-input"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        disabled={addingList}
                      />
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={addingList}
                      >
                        {addingList ? 'Adding...' : 'Add list'}
                      </button>
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => {
                          setShowAddList(false);
                          setNewListTitle('');
                        }}
                        disabled={addingList}
                      >
                        ✕
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </main>
          )}
        </Droppable>
        </DragDropContext>
      )}

      {currentView === 'Table' && <TableView lists={filteredListsData} boardMembers={board.members} />}
      {currentView === 'Dashboard' && <DashboardView lists={filteredListsData} />}
      {currentView === 'Calendar' && <CalendarView lists={filteredListsData} boardId={boardId} setLists={setLists} />}
      {currentView === 'Timeline' && <TimelineView lists={filteredListsData} boardId={boardId} />}
      {['Map'].includes(currentView) && <PlaceholderView viewName={currentView} />}

      {activeCard && (
        <CardModal 
          card={activeCard} 
          listTitle={activeListTitle}
          boardId={boardId}
          onClose={() => setActiveCardId(null)} 
          onUpdate={handleCardUpdate}
        />
      )}

      {/* Floating Bottom Navigation Pill */}
      <div className="bottom-nav-pill">
        <button 
          className={`bottom-nav-btn ${isSidebarOpen ? 'active' : ''}`} 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <span style={{display:'flex'}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v5h3a.75.75 0 0 1 .75.75 1.75 1.75 0 1 0 3.5 0A.75.75 0 0 1 10.5 8h3V3a.5.5 0 0 0-.5-.5zm10.5 7h-2.337a3.251 3.251 0 0 1-6.326 0H2.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5zM12 6H4V4.5h8z" clipRule="evenodd" /></svg></span> Inbox
        </button>
        <div className="bottom-nav-divider" style={{ backgroundColor: 'hsla(0,0%,100%,0.2)' }}></div>
        <button className="bottom-nav-btn active">
          <span style={{display:'flex'}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M1 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2-.5a.5.5 0 0 0-.5.5v5h3a.75.75 0 0 1 .75.75 1.75 1.75 0 1 0 3.5 0A.75.75 0 0 1 10.5 8h3V3a.5.5 0 0 0-.5-.5zm10.5 7h-2.337a3.251 3.251 0 0 1-6.326 0H2.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5zM12 6H4V4.5h8z" clipRule="evenodd" /></svg></span> Board
        </button>
        <div style={{ position: 'relative' }}>
          <button 
            className="bottom-nav-btn" 
            onClick={() => setShowSwitchBoards(!showSwitchBoards)}
            style={{ backgroundColor: showSwitchBoards ? '#282e33' : 'transparent' }}
          >
            <span style={{display:'flex'}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M2 3.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h1.833v-7zm3.333 0v7h2.334v-7zm3.834 0v7H11a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5zM0 4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm14.5 7.75V7H16v4.75A3.25 3.25 0 0 1 12.75 15H5v-1.5h7.75a1.75 1.75 0 0 0 1.75-1.75" clipRule="evenodd" /></svg></span> Switch boards
          </button>
          
          {/* Switch Boards Popover */}
          {showSwitchBoards && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '12px',
              backgroundColor: '#282e33',
              borderRadius: '8px',
              boxShadow: '0 8px 16px -4px rgba(0,0,0,0.5), 0 0 0 1px hsla(0,0%,100%,0.08)',
              width: '320px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              color: '#b6c2cf'
            }}>
              <div style={{ padding: '16px 12px 12px', borderBottom: '1px solid hsla(0,0%,100%,0.16)' }}>
                <input 
                  type="text" 
                  placeholder="Search your boards" 
                  value={switchBoardsSearchQuery}
                  onChange={(e) => setSwitchBoardsSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: '#22272b', border: '1px solid #579dff', borderRadius: '3px', color: '#b6c2cf', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div 
                style={{ padding: '8px 12px', display: 'flex', gap: '8px', borderBottom: '1px solid hsla(0,0%,100%,0.16)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setShowSwitchBoards(false)}
              >
                <button style={{ backgroundColor: '#1c2b41', border: '1px solid #579dff', color: '#579dff', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>All</button>
                <div style={{ display: 'flex', alignItems: 'center', color: '#b6c2cf', fontSize: '14px' }}>Trello Workspace</div>
              </div>
              
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9fadbc', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>⌄</span> Your boards
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {boards
                      .filter(b => b.title.toLowerCase().includes(switchBoardsSearchQuery.toLowerCase()))
                      .map(b => (
                      <div 
                        key={b.id} 
                        style={{ width: '100px', cursor: 'pointer' }}
                        onClick={() => {
                          setShowSwitchBoards(false);
                          navigate(`/b/${b.id}`);
                        }}
                      >
                        <div style={{ height: '56px', borderRadius: '4px', background: 'linear-gradient(to bottom right, #f87168, #9f8fef)', marginBottom: '4px' }}></div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                      </div>
                    ))}
                    {!switchBoardsSearchQuery && (
                      <div style={{ width: '100px', cursor: 'pointer' }}>
                        <div style={{ height: '56px', borderRadius: '4px', backgroundColor: '#22272b', border: '1px solid hsla(0,0%,100%,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9fadbc', fontSize: '12px', textAlign: 'center' }}>
                          Create new board
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b6c2cf', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  <span style={{ color: '#9fadbc' }}>›</span> Jira Projects
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b6c2cf', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  <span style={{ color: '#9fadbc' }}>›</span> Workspace Views
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
      
      {/* Sliding Filter Drawer */}
      <FilterDrawer 
        showFilterMenu={showFilterMenu}
        setShowFilterMenu={setShowFilterMenu}
        filterKeyword={filterKeyword}
        setFilterKeyword={setFilterKeyword}
        filterLabelColors={filterLabelColors}
        toggleLabelFilter={toggleLabelFilter}
        filterMemberIds={filterMemberIds}
        toggleMemberFilter={toggleMemberFilter}
        filterDueDate={filterDueDate}
        setFilterDueDate={setFilterDueDate}
        boardMembers={board.members}
      />
    </div>
  );
};

export default Board;
