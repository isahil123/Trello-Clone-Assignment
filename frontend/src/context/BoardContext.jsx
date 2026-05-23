import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/client';

const BoardContext = createContext();

export const useBoard = () => useContext(BoardContext);

export const BoardProvider = ({ children }) => {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('Board');

  const fetchBoard = useCallback(async (boardId) => {
    if (!boardId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/boards/${boardId}`);
      const boardData = response.data.data;
      setBoard(boardData);
      setLists(boardData.lists);
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('Could not load the board. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCardAdded = useCallback((listId, newCard) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, cards: [...l.cards, { ...newCard, labels: [], members: [] }] }
          : l
      )
    );
  }, []);

  const handleCardUpdate = useCallback((updatedCard) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== updatedCard.listId) return l;
        
        if (updatedCard._deleted) {
          return {
            ...l,
            cards: l.cards.filter((c) => c.id !== updatedCard.id),
          };
        }
        
        return {
          ...l,
          cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
        };
      })
    );
  }, []);

  const addList = useCallback((newList) => {
    setLists((prev) => [...prev, { ...newList, cards: [] }]);
  }, []);

  const value = {
    board,
    lists,
    setLists,
    loading,
    error,
    fetchBoard,
    handleCardAdded,
    handleCardUpdate,
    addList,
    currentView,
    setCurrentView,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};
