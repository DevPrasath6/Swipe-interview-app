import {configureStore, createSlice} from '@reduxjs/toolkit';
import {loadState, saveState} from '../services/persistence';

// Load initial state from localStorage
const initialState = loadState() || { candidates: [], sessions: [], currentSession: null };

const candidatesSlice = createSlice({
  name:'candidates',
  initialState: initialState.candidates || [],
  reducers:{
    addCandidate(state, action){
      state.push({
        id: action.payload.id || Date.now().toString(),
        name: action.payload.name || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
        score: action.payload.score || 0,
        status: action.payload.status || 'completed',
        summary: action.payload.summary || '',
        completedAt: action.payload.completedAt || new Date().toISOString(),
        ...action.payload
      });
    },
    updateCandidate(state, action){
      const idx = state.findIndex(c=>c.id === action.payload.id);
      if(idx>=0) state[idx] = {...state[idx], ...action.payload};
    }
  }
});

const sessionsSlice = createSlice({
  name:'sessions',
  initialState: initialState.sessions || [],
  reducers:{
    addSession(state, action){
      state.push({
        id: action.payload.id || Date.now().toString(),
        candidateId: action.payload.candidateId,
        inProgress: true,
        currentQuestionIndex: 0,
        questions: action.payload.questions || [],
        answers: [],
        startedAt: new Date().toISOString(),
        timerStartedAt: null,
        timerDuration: 0,
        stage: 'resume-upload', // resume-upload, missing-fields, interview, completed
        ...action.payload
      });
    },
    updateSession(state, action){
      const idx = state.findIndex(s=>s.id === action.payload.id);
      if(idx>=0) {
        state[idx] = {...state[idx], ...action.payload};
      }
    },
    addAnswer(state, action) {
      const session = state.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.answers.push({
          questionIndex: action.payload.questionIndex,
          question: action.payload.question,
          answer: action.payload.answer,
          timeSpent: action.payload.timeSpent,
          score: action.payload.score,
          feedback: action.payload.feedback,
          submittedAt: new Date().toISOString()
        });
      }
    },
    updateTimer(state, action) {
      const session = state.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.timerStartedAt = action.payload.timerStartedAt;
        session.timerDuration = action.payload.timerDuration;
      }
    }
  }
});

const currentSessionSlice = createSlice({
  name: 'currentSession',
  initialState: initialState.currentSession || null,
  reducers: {
    setCurrentSession(state, action) {
      return action.payload;
    },
    clearCurrentSession(state) {
      return null;
    }
  }
});

const store = configureStore({
  reducer:{
    candidates: candidatesSlice.reducer,
    sessions: sessionsSlice.reducer,
    currentSession: currentSessionSlice.reducer
  }
});

// Save to localStorage on every state change
store.subscribe(() => {
  try {
    const state = store.getState();
    saveState({
      candidates: state.candidates,
      sessions: state.sessions,
      currentSession: state.currentSession
    });
  } catch(e) {
    console.error('Failed to save state:', e);
  }
});

export const {addCandidate, updateCandidate} = candidatesSlice.actions;
export const {addSession, updateSession, addAnswer, updateTimer} = sessionsSlice.actions;
export const {setCurrentSession, clearCurrentSession} = currentSessionSlice.actions;
export default store;
