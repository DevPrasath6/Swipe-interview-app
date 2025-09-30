import React, { useState, useEffect, useRef } from 'react';

// Sample questions for the interview
const QUESTIONS = [
  { id: 1, text: "What is React and how does it differ from traditional web development?", difficulty: "Easy", timeLimit: 20 },
  { id: 2, text: "Explain the difference between let, const, and var in JavaScript.", difficulty: "Easy", timeLimit: 20 },
  { id: 3, text: "How would you optimize performance in a React application with a large list?", difficulty: "Medium", timeLimit: 60 },
  { id: 4, text: "What are React hooks and why were they introduced?", difficulty: "Medium", timeLimit: 60 },
  { id: 5, text: "Design a scalable REST API for a social media platform.", difficulty: "Hard", timeLimit: 120 },
  { id: 6, text: "How would you handle state management in a large React application?", difficulty: "Hard", timeLimit: 120 }
];

// Interview Session Component
function InterviewSession() {
  const [stage, setStage] = useState('welcome'); // welcome, upload, info, interview, completed
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [candidate, setCandidate] = useState({ name: '', email: '', phone: '' });
  const [uploadedFile, setUploadedFile] = useState(null);

  const timerRef = useRef();

  const handleTimeUp = () => {
    setIsTimerActive(false);
    clearTimeout(timerRef.current);
    handleSubmitAnswer();
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const score = Math.floor(Math.random() * 40) + 60; // Random score 60-100

    const newAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      answer: currentAnswer,
      score: score,
      timeSpent: currentQuestion.timeLimit - timer,
      difficulty: currentQuestion.difficulty
    };

    setAnswers([...answers, newAnswer]);
    setCurrentAnswer('');
    setIsTimerActive(false);
    clearTimeout(timerRef.current);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      startTimer(QUESTIONS[currentQuestionIndex + 1].timeLimit);
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length;

    // Save to local storage
    const candidateData = {
      ...candidate,
      id: Date.now(),
      score: Math.round(totalScore),
      answers: answers,
      completedAt: new Date().toISOString(),
      status: 'completed'
    };

    const existingCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    existingCandidates.push(candidateData);
    localStorage.setItem('candidates', JSON.stringify(existingCandidates));

    setStage('completed');
  };

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (isTimerActive && timer === 0) {
      handleTimeUp();
    }

    return () => clearTimeout(timerRef.current);
  }, [timer, isTimerActive, currentQuestionIndex, currentAnswer, answers, candidate]);

  const startTimer = (timeLimit) => {
    setTimer(timeLimit);
    setIsTimerActive(true);
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    clearTimeout(timerRef.current);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Simulate parsing resume
      setTimeout(() => {
        setCandidate({
          name: 'John Doe', // Simulated parsed name
          email: '', // Will be filled in info stage
          phone: '' // Will be filled in info stage
        });
        setStage('info');
      }, 1000);
    }
  };

  const handleStartInterview = () => {
    if (candidate.name && candidate.email && candidate.phone) {
      setStage('interview');
      setCurrentQuestionIndex(0);
      startTimer(QUESTIONS[0].timeLimit);
    } else {
      alert('Please fill in all required information');
    }
  };

  const resetInterview = () => {
    setStage('welcome');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setTimer(0);
    setIsTimerActive(false);
    setCandidate({ name: '', email: '', phone: '' });
    setUploadedFile(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (stage === 'welcome') {
    return (
      <div className="interview-container">
        <div className="welcome-card">
          <h2>🎯 Welcome to AI-Powered Interview</h2>
          <p>This interview consists of 6 questions with different difficulty levels:</p>
          <ul>
            <li>📝 2 Easy questions (20 seconds each)</li>
            <li>⚡ 2 Medium questions (60 seconds each)</li>
            <li>🚀 2 Hard questions (120 seconds each)</li>
          </ul>
          <button
            onClick={() => setStage('upload')}
            className="btn btn-primary btn-large"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'upload') {
    return (
      <div className="interview-container">
        <div className="upload-card">
          <h3>📄 Upload Your Resume</h3>
          <div className="upload-box">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="file-input"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="upload-label">
              {uploadedFile ? `✅ ${uploadedFile.name}` : '📁 Click to upload PDF or DOCX'}
            </label>
          </div>
          <button
            onClick={() => setStage('info')}
            className="btn btn-secondary"
          >
            Skip Upload (Demo)
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'info') {
    return (
      <div className="interview-container">
        <div className="info-card">
          <h3>📋 Complete Your Information</h3>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={candidate.name}
              onChange={(e) => setCandidate({...candidate, name: e.target.value})}
              placeholder="Enter your full name"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={candidate.email}
              onChange={(e) => setCandidate({...candidate, email: e.target.value})}
              placeholder="Enter your email"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={candidate.phone}
              onChange={(e) => setCandidate({...candidate, phone: e.target.value})}
              placeholder="Enter your phone number"
              className="form-input"
            />
          </div>
          <button
            onClick={handleStartInterview}
            className="btn btn-primary btn-large"
            disabled={!candidate.name || !candidate.email || !candidate.phone}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'interview') {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="interview-container">
        <div className="question-header">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="question-meta">
            <span className="question-number">
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </span>
            <span className={`difficulty-badge difficulty-${currentQuestion.difficulty.toLowerCase()}`}>
              {currentQuestion.difficulty}
            </span>
            <span className={`timer ${timer <= 10 ? 'timer-warning' : ''}`}>
              ⏰ {formatTime(timer)}
            </span>
          </div>
        </div>

        <div className="question-card">
          <div className="question-text">
            {currentQuestion.text}
          </div>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="answer-textarea"
            rows={8}
          />

          <div className="question-actions">
            <button
              onClick={() => {
                setCurrentAnswer('No answer provided');
                handleSubmitAnswer();
              }}
              className="btn btn-secondary"
            >
              Skip Question
            </button>
            <button
              onClick={handleSubmitAnswer}
              className="btn btn-primary"
              disabled={!currentAnswer.trim()}
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'completed') {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length;

    return (
      <div className="interview-container">
        <div className="completion-card">
          <h2>🎉 Interview Completed!</h2>

          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{Math.round(totalScore)}</span>
              <span className="score-label">Overall Score</span>
            </div>
          </div>

          <div className="results-breakdown">
            <h3>Question Breakdown:</h3>
            {answers.map((answer, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span>Q{index + 1}: {answer.difficulty}</span>
                  <span className="score">{answer.score}/100</span>
                </div>
                <div className="result-question">{answer.question}</div>
                <div className="result-answer">{answer.answer}</div>
              </div>
            ))}
          </div>

          <div className="completion-actions">
            <button
              onClick={resetInterview}
              className="btn btn-primary"
            >
              Take Another Interview
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

// Dashboard Component
function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = () => {
    const savedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    setCandidates(savedCandidates);
  };

  const filteredAndSortedCandidates = candidates
    .filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.completedAt) - new Date(a.completedAt);
        default:
          return 0;
      }
    });

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#FF9800';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (selectedCandidate) {
    return (
      <div className="dashboard-container">
        <div className="candidate-detail">
          <div className="detail-header">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="btn btn-secondary"
            >
              ← Back to Dashboard
            </button>
            <h2>{selectedCandidate.name}</h2>
          </div>

          <div className="candidate-info">
            <div className="info-card">
              <h3>Candidate Information</h3>
              <div className="info-item">
                <strong>Name:</strong> {selectedCandidate.name}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {selectedCandidate.email}
              </div>
              <div className="info-item">
                <strong>Phone:</strong> {selectedCandidate.phone}
              </div>
              <div className="info-item">
                <strong>Completed:</strong> {formatDate(selectedCandidate.completedAt)}
              </div>
              <div className="info-item">
                <strong>Overall Score:</strong>
                <span style={{ color: getScoreColor(selectedCandidate.score), fontWeight: 'bold', marginLeft: '8px' }}>
                  {selectedCandidate.score}/100
                </span>
              </div>
            </div>
          </div>

          <div className="answers-section">
            <h3>Interview Answers</h3>
            {selectedCandidate.answers?.map((answer, index) => (
              <div key={index} className="answer-card">
                <div className="answer-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className={`difficulty-badge difficulty-${answer.difficulty?.toLowerCase()}`}>
                    {answer.difficulty}
                  </span>
                  <span className="answer-score" style={{ color: getScoreColor(answer.score) }}>
                    {answer.score}/100
                  </span>
                </div>
                <div className="answer-question">
                  <strong>Q:</strong> {answer.question}
                </div>
                <div className="answer-response">
                  <strong>A:</strong> {answer.answer}
                </div>
                <div className="answer-meta">
                  Time spent: {answer.timeSpent}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Interviewer Dashboard</h2>
        <button
          onClick={loadCandidates}
          className="btn btn-secondary"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{candidates.length}</h3>
          <p>Total Candidates</p>
        </div>
        <div className="stat-card">
          <h3>{candidates.filter(c => c.status === 'completed').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>
            {candidates.length > 0
              ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
              : 0
            }
          </h3>
          <p>Average Score</p>
        </div>
        <div className="stat-card">
          <h3>{candidates.filter(c => c.score >= 80).length}</h3>
          <p>High Performers</p>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      <div className="candidates-table">
        {filteredAndSortedCandidates.length === 0 ? (
          <div className="empty-state">
            <h3>No candidates found</h3>
            <p>No interviews have been completed yet or no matches for your search.</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Score</span>
              <span>Date</span>
              <span>Actions</span>
            </div>
            {filteredAndSortedCandidates.map(candidate => (
              <div key={candidate.id} className="table-row">
                <span className="candidate-name">{candidate.name}</span>
                <span className="candidate-email">{candidate.email}</span>
                <span
                  className="candidate-score"
                  style={{ color: getScoreColor(candidate.score) }}
                >
                  {candidate.score}/100
                </span>
                <span className="candidate-date">{formatDate(candidate.completedAt)}</span>
                <span className="candidate-actions">
                  <button
                    onClick={() => setSelectedCandidate(candidate)}
                    className="btn btn-small btn-primary"
                  >
                    View Details
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

// Main App Component
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
