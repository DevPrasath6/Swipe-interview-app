import React from 'react';
import { useSelector } from 'react-redux';

export default function CandidateDetailDrawer({ candidate, onClose, open }) {
  const sessions = useSelector(state => state.sessions || []);

  if (!candidate) return null;

  // Find the session for this candidate
  const candidateSession = sessions.find(session =>
    session.candidate?.email === candidate.email && !session.inProgress
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getDifficultyIcon = (level) => {
    switch (level) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '❓';
    }
  };

  return (
    <div className={`detail-drawer ${open ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Candidate Details</h3>
        <button onClick={onClose} className="btn btn-secondary">
          ✕ Close
        </button>
      </div>

      <div className="drawer-content">
        {/* Candidate Info */}
        <div className="section">
          <h4>👤 Personal Information</h4>
          <div style={{ marginBottom: '16px' }}>
            <div><strong>Name:</strong> {candidate.name}</div>
            <div><strong>Email:</strong> {candidate.email}</div>
            <div><strong>Phone:</strong> {candidate.phone}</div>
            <div><strong>Completed:</strong> {formatDate(candidate.completedAt)}</div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="section">
          <h4>📊 Final Score</h4>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: getScoreColor(candidate.score),
            marginBottom: '16px'
          }}>
            {candidate.score}/100
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            <strong>AI Summary:</strong><br />
            {candidate.summary}
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="section">
          <h4>💬 Interview Responses</h4>
          {candidate.answers && candidate.answers.length > 0 ? (
            <div>
              {candidate.answers.map((answer, index) => (
                <div key={index} className="qa-item">
                  <div className="qa-question">
                    {getDifficultyIcon(candidateSession?.questions?.[index]?.level)}
                    <strong>Q{index + 1}:</strong> {answer.question}
                  </div>

                  <div className="qa-answer">
                    <strong>Answer:</strong> {answer.answer || '(No answer provided)'}
                  </div>

                  <div className="qa-score">
                    <div>
                      <span style={{ color: getScoreColor(answer.score) }}>
                        <strong>Score: {answer.score}/100</strong>
                      </span>
                      <span style={{ marginLeft: '16px', color: '#666' }}>
                        Time: {answer.timeSpent}s
                        {answer.timeUp && ' ⏰ (Time up)'}
                      </span>
                    </div>
                  </div>

                  {answer.feedback && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f8f9fa',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <strong>Feedback:</strong> {answer.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No detailed answers available for this candidate.
            </div>
          )}
        </div>

        {/* Performance Breakdown */}
        {candidate.answers && candidate.answers.length > 0 && (
          <div className="section">
            <h4>📈 Performance Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {['easy', 'medium', 'hard'].map(difficulty => {
                const difficultyAnswers = candidate.answers.filter((_, index) => {
                  const questionLevel = candidateSession?.questions?.[index]?.level;
                  return questionLevel === difficulty;
                });

                if (difficultyAnswers.length === 0) return null;

                const avgScore = Math.round(
                  difficultyAnswers.reduce((sum, answer) => sum + answer.score, 0) / difficultyAnswers.length
                );

                return (
                  <div key={difficulty} style={{
                    textAlign: 'center',
                    padding: '12px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                      {getDifficultyIcon(difficulty)}
                    </div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666' }}>
                      {difficulty}
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: getScoreColor(avgScore)
                    }}>
                      {avgScore}/100
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session Details */}
        {candidateSession && (
          <div className="section" style={{ marginTop: '24px', fontSize: '12px', color: '#666' }}>
            <h5>Session Details</h5>
            <div>Session ID: {candidateSession.id}</div>
            <div>Started: {formatDate(candidateSession.startedAt)}</div>
            {candidateSession.completedAt && (
              <div>Completed: {formatDate(candidateSession.completedAt)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
