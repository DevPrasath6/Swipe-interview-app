import React from 'react';

export default function ResumePreview({parsed, onConfirm}){
  return (
    <div style={{border:'1px solid #eee', padding:8, marginTop:8}}>
      <h4>Parsed Resume</h4>
      <div><strong>Name:</strong> {parsed.name || '—'}</div>
      <div><strong>Email:</strong> {parsed.email || '—'}</div>
      <div><strong>Phone:</strong> {parsed.phone || '—'}</div>
      <button onClick={onConfirm} style={{marginTop:8}}>Confirm & Continue</button>
    </div>
  );
}
