const KEY = 'swipe_interview_app_v1';

export function saveState(state){
  try{
    localStorage.setItem(KEY, JSON.stringify({
      ...state,
      savedAt: new Date().toISOString()
    }));
  }catch(e){
    console.error('Failed to save state:', e);
  }
}

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return undefined;
    return JSON.parse(raw);
  }catch(e){
    console.error('Failed to load state:', e);
    return undefined;
  }
}

export function clearState(){
  try{localStorage.removeItem(KEY);}catch(e){}
}

export function hasUnfinishedSession(){
  const state = loadState();
  if(!state || !state.sessions) return false;

  // Check for any session that's in progress
  const unfinishedSession = state.sessions.find(session =>
    session.inProgress &&
    (session.stage === 'missing-fields' || session.stage === 'interview' || session.currentQuestionIndex < 6)
  );

  return !!unfinishedSession;
}

export function getUnfinishedSession() {
  const state = loadState();
  if(!state || !state.sessions) return null;

  return state.sessions.find(session =>
    session.inProgress &&
    (session.stage === 'missing-fields' || session.stage === 'interview' || session.currentQuestionIndex < 6)
  ) || null;
}
