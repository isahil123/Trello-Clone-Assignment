import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

// Helper to update board cache
const updateBoardCache = (queryClient, boardId, updater) => {
  queryClient.setQueryData(['board', boardId], (oldData) => {
    if (!oldData) return oldData;
    return updater(oldData);
  });
};

export const useMoveCard = () => {
  return useMutation({
    mutationFn: async (items) => {
      const res = await apiClient.patch('/cards/move', { items });
      return res.data.data;
    },
    // We expect optimistic updates to be handled by the caller BEFORE calling this, 
    // because dnd-kit events are synchronous and we want immediate visual feedback.
    // If it fails, we invalidate to refetch.
  });
};

export const useMoveList = () => {
  return useMutation({
    mutationFn: async (items) => {
      const res = await apiClient.patch('/lists/move', { items });
      return res.data.data;
    }
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, data }) => {
      const res = await apiClient.patch(`/cards/${cardId}`, data);
      return res.data.data;
    },
    onSuccess: (updatedCard, variables) => {
      // Find which board this card belongs to by checking cache
      const queries = queryClient.getQueriesData({ queryKey: ['board'] });
      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        const boardId = queryKey[1];
        let found = false;
        const newLists = oldData.lists.map(list => {
          if (list.cards.some(c => c.id === updatedCard.id)) {
            found = true;
            return {
              ...list,
              cards: list.cards.map(c => c.id === updatedCard.id ? { ...c, ...updatedCard } : c)
            };
          }
          return list;
        });
        if (found) {
          updateBoardCache(queryClient, boardId, () => ({ ...oldData, lists: newLists }));
        }
      });
    }
  });
};

export const useAddCard = (boardId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/cards', data);
      return res.data.data;
    },
    onSuccess: (newCard) => {
      updateBoardCache(queryClient, boardId, (oldData) => ({
        ...oldData,
        lists: oldData.lists.map(list => 
          list.id === newCard.listId 
            ? { ...list, cards: [...list.cards, newCard] }
            : list
        )
      }));
    }
  });
};

export const useAddList = (boardId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/lists', data);
      return res.data.data;
    },
    onSuccess: (newList) => {
      updateBoardCache(queryClient, boardId, (oldData) => ({
        ...oldData,
        lists: [...oldData.lists, { ...newList, cards: [] }]
      }));
    }
  });
};

export const useDeleteList = (boardId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listId) => {
      await apiClient.delete(`/lists/${listId}`);
      return listId;
    },
    onSuccess: (listId) => {
      updateBoardCache(queryClient, boardId, (oldData) => ({
        ...oldData,
        lists: oldData.lists.filter(list => list.id !== listId)
      }));
    }
  });
};

export const useUpdateList = (boardId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, title }) => {
      const res = await apiClient.patch(`/lists/${listId}`, { title });
      return res.data.data;
    },
    onSuccess: (updatedList) => {
      updateBoardCache(queryClient, boardId, (oldData) => ({
        ...oldData,
        lists: oldData.lists.map(list => list.id === updatedList.id ? { ...list, title: updatedList.title } : list)
      }));
    }
  });
};
