import { createSlice } from '@reduxjs/toolkit';

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: [],
  reducers: {
    addSession: (state, action) => {
      state.push({
        id: action.payload.id || Date.now().toString(),
        candidateId: action.payload.candidateId,
        candidate: action.payload.candidate || {},
        inProgress: true,
        currentQuestionIndex: 0,
        questions: action.payload.questions || [],
        answers: [],
        startedAt: new Date().toISOString(),
        timerStartedAt: null,
        timerDuration: 0,
        stage: 'resume-upload', // resume-upload, missing-fields, interview, completed
        missingFields: action.payload.missingFields || [],
        currentMissingFieldIndex: 0,
        ...action.payload
      });
    },
    updateSession: (state, action) => {
      const index = state.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
    addAnswer: (state, action) => {
      const session = state.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.answers.push({
          questionIndex: action.payload.questionIndex,
          question: action.payload.question,
          answer: action.payload.answer,
          timeSpent: action.payload.timeSpent,
          timeUp: action.payload.timeUp || false,
          score: action.payload.score || 0,
          feedback: action.payload.feedback || '',
          submittedAt: new Date().toISOString(),
          ...action.payload
        });
      }
    },
    updateTimer: (state, action) => {
      const session = state.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.timerStartedAt = action.payload.timerStartedAt;
        session.timerDuration = action.payload.timerDuration;
      }
    },
    completeSession: (state, action) => {
      const session = state.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.inProgress = false;
        session.completedAt = new Date().toISOString();
        session.stage = 'completed';
        session.finalScore = action.payload.finalScore || 0;
      }
    },
    removeSession: (state, action) => {
      return state.filter(session => session.id !== action.payload.id);
    },
    clearSessions: () => {
      return [];
    }
  }
});

export const {
  addSession,
  updateSession,
  addAnswer,
  updateTimer,
  completeSession,
  removeSession,
  clearSessions
} = sessionsSlice.actions;
export default sessionsSlice.reducer;
