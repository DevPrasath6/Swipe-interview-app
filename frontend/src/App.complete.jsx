import React, { useState, useEffect } from 'react';
import InterviewSession from './components/interview/InterviewSession.full';
import Dashboard from './components/dashboard/Dashboard.full';
import './index.complete.css';

// Welcome Back Modal Component
function WelcomeBackModal({ visible, onResume, onStartNew }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>👋 Welcome Back!</h3>
        <p>We found an unfinished interview session. Would you like to resume or start a new session?</p>
        <div className="modal-actions">
          <button onClick={onStartNew} className="btn btn-secondary">
            Start New
          </button>
          <button onClick={onResume} className="btn btn-primary">
            Resume Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('interviewee');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    // Check for unfinished sessions on app start
    const unfinishedSession = localStorage.getItem('unfinished_interview');
    if (unfinishedSession) {
      setShowWelcomeBack(true);
    }
  }, []);

  const handleResumeSession = () => {
    setShowWelcomeBack(false);
    setActiveTab('interviewee');
  };

  const handleStartNew = () => {
    localStorage.removeItem('unfinished_interview');
    setShowWelcomeBack(false);
    setActiveTab('interviewee');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    // Broadcast tab change to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('interview_tabs');
      channel.postMessage({ type: 'TAB_SWITCH', tab });
      channel.close();
    }
  };

  // Listen for tab changes from other browser tabs
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('interview_tabs');
      channel.onmessage = (event) => {
        if (event.data.type === 'TAB_SWITCH') {
          setActiveTab(event.data.tab);
        }
      };

      return () => channel.close();
    }
  }, []);

  return (
    <div className="app">
      {/* Tab Bar */}
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'interviewee' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('interviewee')}
        >
          🎯 Interviewee
        </button>
        <button
          className={`tab ${activeTab === 'interviewer' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('interviewer')}
        >
          📊 Interviewer Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'interviewee' && <InterviewSession />}
        {activeTab === 'interviewer' && <Dashboard />}
      </div>

      {/* Welcome Back Modal */}
      <WelcomeBackModal
        visible={showWelcomeBack}
        onResume={handleResumeSession}
        onStartNew={handleStartNew}
      />
    </div>
  );
}
