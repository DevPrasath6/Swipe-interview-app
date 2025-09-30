import React, { useState } from 'react';
import './index.css';

// Simple working components for now
function IntervieweeTab() {
  const [step, setStep] = useState('upload');

  return (
    <div className="tab-content">
      <div className="container">
        <h2>🎯 AI-Powered Interview</h2>

        {step === 'upload' && (
          <div className="upload-section">
            <div className="upload-box">
              <h3>📄 Upload Your Resume</h3>
              <p>Upload your resume in PDF or DOCX format to get started.</p>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setStep('interview');
                  }
                }}
                className="file-input"
              />
              <button
                onClick={() => setStep('interview')}
                className="btn btn-primary"
              >
                Skip Upload (Demo)
              </button>
            </div>
          </div>
        )}

        {step === 'interview' && (
          <div className="interview-section">
            <h3>💬 Interview in Progress</h3>
            <div className="question-card">
              <div className="question-header">
                <span className="question-number">Question 1 of 6</span>
                <span className="difficulty-badge difficulty-easy">Easy</span>
                <span className="timer">⏰ 20s</span>
              </div>
              <div className="question-text">
                What is React and how does it differ from traditional web development?
              </div>
              <textarea
                className="answer-input"
                placeholder="Type your answer here..."
                rows={6}
              />
              <div className="question-actions">
                <button className="btn btn-secondary">Skip</button>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep('completed')}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="completion-section">
            <h3>🎉 Interview Completed!</h3>
            <div className="results-card">
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-number">85</span>
                  <span className="score-label">Score</span>
                </div>
              </div>
              <p>Congratulations! You have completed the interview.</p>
              <button
                className="btn btn-primary"
                onClick={() => setStep('upload')}
              >
                Start New Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InterviewerTab() {
  const sampleCandidates = [
    { id: 1, name: 'John Doe', email: 'john@example.com', score: 85, status: 'Completed' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', score: 92, status: 'Completed' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', score: 78, status: 'In Progress' }
  ];

  return (
    <div className="tab-content">
      <div className="container">
        <h2>📊 Interviewer Dashboard</h2>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>3</h3>
            <p>Total Candidates</p>
          </div>
          <div className="stat-card">
            <h3>2</h3>
            <p>Completed</p>
          </div>
          <div className="stat-card">
            <h3>85</h3>
            <p>Avg Score</p>
          </div>
        </div>

        <div className="candidates-section">
          <h3>Recent Candidates</h3>
          <div className="candidates-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Score</span>
              <span>Status</span>
            </div>
            {sampleCandidates.map(candidate => (
              <div key={candidate.id} className="table-row">
                <span>{candidate.name}</span>
                <span>{candidate.email}</span>
                <span className="score">{candidate.score}</span>
                <span className={`status ${candidate.status.toLowerCase().replace(' ', '-')}`}>
                  {candidate.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('interviewee');

  return (
    <div className="app">
      {/* Tab Bar */}
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'interviewee' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviewee')}
        >
          🎯 Interviewee
        </button>
        <button
          className={`tab ${activeTab === 'interviewer' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviewer')}
        >
          📊 Interviewer Dashboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'interviewee' && <IntervieweeTab />}
      {activeTab === 'interviewer' && <InterviewerTab />}
    </div>
  );
}
