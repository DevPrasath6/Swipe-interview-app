import React from 'react';

export default function Topbar({ activeTab, onTabChange }) {
  return (
    <div className="topbar">
      <div className="topbar-content">
        <div className="topbar-left">
          <h1 className="app-title">
            🤖 AI Interview Assistant
          </h1>
        </div>

        <div className="topbar-center">
          <nav className="tab-navigation">
            <button
              className={`nav-tab ${activeTab === 'interviewee' ? 'active' : ''}`}
              onClick={() => onTabChange('interviewee')}
            >
              👨‍💻 Interviewee
            </button>
            <button
              className={`nav-tab ${activeTab === 'interviewer' ? 'active' : ''}`}
              onClick={() => onTabChange('interviewer')}
            >
              👩‍💼 Interviewer
            </button>
          </nav>
        </div>

        <div className="topbar-right">
          <div className="status-indicator">
            <span className="status-dot online"></span>
            <span className="status-text">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
