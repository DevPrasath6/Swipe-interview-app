// Small wrapper for persistence strategy. Currently uses localStorage via services/persistence.
import {loadState, saveState} from '../services/persistence';

export function loadAppState(){
  return loadState();
}

export function saveAppState(state){
  saveState(state);
}
