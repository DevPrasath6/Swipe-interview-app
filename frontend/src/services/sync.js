// Simple BroadcastChannel-based sync for same-origin tabs. Falls back to localStorage events.
const CHANNEL = 'swipe_interview_sync_v1';

export function createSync(handler){
  if(typeof BroadcastChannel !== 'undefined'){
    const bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = e=> handler && handler(e.data);
    return {post: data=>bc.postMessage(data), close: ()=>bc.close()};
  }

  function onStorage(e){
    if(e.key === CHANNEL && e.newValue){
      try{ handler(JSON.parse(e.newValue)); }catch(e){}
    }
  }
  window.addEventListener('storage', onStorage);
  return {post: data=> localStorage.setItem(CHANNEL, JSON.stringify(data)), close: ()=> window.removeEventListener('storage', onStorage)};
}
