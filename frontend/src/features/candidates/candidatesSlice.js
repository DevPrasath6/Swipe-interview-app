import { createSlice } from '@reduxjs/toolkit';

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState: [],
  reducers: {
    addCandidate: (state, action) => {
      state.push({
        id: action.payload.id || Date.now().toString(),
        name: action.payload.name || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
        score: action.payload.score || 0,
        status: action.payload.status || 'completed',
        summary: action.payload.summary || '',
        answers: action.payload.answers || [],
        completedAt: action.payload.completedAt || new Date().toISOString(),
        ...action.payload
      });
    },
    updateCandidate: (state, action) => {
      const index = state.findIndex(candidate => candidate.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
    removeCandidate: (state, action) => {
      return state.filter(candidate => candidate.id !== action.payload.id);
    },
    clearCandidates: () => {
      return [];
    }
  }
});

export const { addCandidate, updateCandidate, removeCandidate, clearCandidates } = candidatesSlice.actions;
export default candidatesSlice.reducer;
