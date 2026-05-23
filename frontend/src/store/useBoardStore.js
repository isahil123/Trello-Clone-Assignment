import { create } from 'zustand';

const useBoardStore = create((set) => ({
  // UI State
  activeCardId: null,
  isSidebarOpen: false,
  isCreateBoardModalOpen: false,

  // Drag State
  activeDragItem: null, // { id, type, listId, card }
  
  // Quick Edit State
  quickEditCard: null, // { card, rect }
  
  // Filter State
  searchQuery: '',
  filters: {
    labels: [], // array of label IDs
    members: [], // array of member IDs
    dueDate: null, // 'overdue', 'nextDay', 'complete', 'incomplete'
  },

  // Actions
  setActiveCardId: (id) => set({ activeCardId: id }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setCreateBoardModalOpen: (isOpen) => set({ isCreateBoardModalOpen: isOpen }),
  setQuickEditCard: (data) => set({ quickEditCard: data }),
  
  setActiveDragItem: (item) => set({ activeDragItem: item }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleFilterLabel: (labelId) => set((state) => ({
    filters: {
      ...state.filters,
      labels: state.filters.labels.includes(labelId)
        ? state.filters.labels.filter(id => id !== labelId)
        : [...state.filters.labels, labelId]
    }
  })),
  toggleFilterMember: (memberId) => set((state) => ({
    filters: {
      ...state.filters,
      members: state.filters.members.includes(memberId)
        ? state.filters.members.filter(id => id !== memberId)
        : [...state.filters.members, memberId]
    }
  })),
  setFilterDueDate: (status) => set((state) => ({
    filters: { ...state.filters, dueDate: state.filters.dueDate === status ? null : status }
  })),
  clearFilters: () => set({
    searchQuery: '',
    filters: { labels: [], members: [], dueDate: null }
  }),
}));

export default useBoardStore;
