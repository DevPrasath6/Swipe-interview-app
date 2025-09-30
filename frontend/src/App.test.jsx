// Temporary simple App.jsx for debugging
import React from 'react';
import './index.css';

export default function App() {
  return (
    <div className="app">
      <h1>🤖 AI-Powered Interview Assistant</h1>
      <div className="tab-bar">
        <button className="tab active">Interviewee</button>
        <button className="tab">Interviewer Dashboard</button>
      </div>
      <div className="tab-content">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>✅ Application is working!</h2>
          <p>If you can see this, the basic app structure is functional.</p>
          <p>We can now debug and add components back step by step.</p>
        </div>
      </div>
    </div>
  );
}
