import React, { useState, useEffect } from 'react';

export default function Dashboard() {
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
