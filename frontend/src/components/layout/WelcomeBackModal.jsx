import React from 'react';

export default function WelcomeBackModal({visible, onResume, onStartNew}){
  if(!visible) return null;
  return (
    <div style={{position:'fixed', left:0, top:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#fff', padding:20, borderRadius:6, width:420}}>
        <h3>Welcome back</h3>
        <p>We found an unfinished interview session. Would you like to resume or start a new session?</p>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button onClick={onStartNew}>Start New</button>
          <button onClick={onResume}>Resume</button>
        </div>
      </div>
    </div>
  );
}
