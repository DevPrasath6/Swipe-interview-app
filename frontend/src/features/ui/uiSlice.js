import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'interviewee', // interviewee | interviewer
    sidebarOpen: false,
    loading: false,
    error: null,
    notifications: [],
    theme: 'light',
    selectedCandidateId: null,
    searchTerm: '',
    sortBy: 'score',
    sortOrder: 'desc'
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type || 'info', // info | success | warning | error
        timestamp: new Date().toISOString(),
        duration: action.payload.duration || 5000
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload.id
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidateId = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    resetUI: (state) => {
      state.selectedCandidateId = null;
      state.searchTerm = '';
      state.error = null;
      state.notifications = [];
    }
  }
});

export const {
  setActiveTab,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  setError,
  clearError,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  setSelectedCandidate,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;
