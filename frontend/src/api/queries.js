import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

export const useHomeBoards = () => {
  return useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await apiClient.get('/boards');
      return res.data.data;
    },
  });
};

export const useBoardData = (boardId) => {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const res = await apiClient.get(`/boards/${boardId}`);
      return res.data.data;
    },
    enabled: !!boardId,
  });
};
