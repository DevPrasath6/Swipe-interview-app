// AI Explainability component - shows how AI scored the answer
import React, { useState, useEffect } from 'react';
import { useAIExplanation } from '../../../hooks/useAIExplanation';

export default function AIExplain({ answer, question, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { explanation, isLoading, error, generateExplanation } = useAIExplanation();

  useEffect(() => {
    if (answer && question) {
      generateExplanation(answer, question);
    }
  }, [answer, question, generateExplanation]);

  if (!answer || !question) {
    return null;
  }

  const scoreColor = getScoreColor(answer.score);
  const scoreLabel = getScoreLabel(answer.score);

  return (
    <div className="ai-explain">
      <div className="ai-explain__header">
        <div className="ai-explain__title">
          <span className="ai-explain__icon">🤖</span>
          <h3>AI Explanation</h3>
          {onClose && (
            <button onClick={onClose} className="ai-explain__close">
              ✕
            </button>
          )}
        </div>

        <div className="ai-explain__score">
          <div className={`ai-explain__score-badge ai-explain__score-badge--${scoreColor}`}>
            {answer.score}/100
          </div>
          <span className="ai-explain__score-label">{scoreLabel}</span>
        </div>
      </div>

      <div className="ai-explain__content">
        {/* Question Context */}
        <div className="ai-explain__section">
          <h4>Question</h4>
          <p className="ai-explain__question">{question.text}</p>
          <div className="ai-explain__question-meta">
            <span className={`ai-explain__difficulty ai-explain__difficulty--${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
            <span className="ai-explain__category">{question.category}</span>
          </div>
        </div>

        {/* Answer Summary */}
        <div className="ai-explain__section">
          <h4>Your Answer</h4>
          <div className="ai-explain__answer">
            {answer.text.length > 200 && !isExpanded ? (
              <>
                <p>{answer.text.substring(0, 200)}...</p>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="ai-explain__expand"
                >
                  Show more
                </button>
              </>
            ) : (
              <>
                <p>{answer.text}</p>
                {answer.text.length > 200 && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="ai-explain__expand"
                  >
                    Show less
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="ai-explain__section">
          <h4>AI Analysis</h4>

          {isLoading && (
            <div className="ai-explain__loading">
              <div className="ai-explain__spinner"></div>
              <p>Analyzing your answer...</p>
            </div>
          )}

          {error && (
            <div className="ai-explain__error">
              <p>❌ {error}</p>
            </div>
          )}

          {explanation && !isLoading && (
            <div className="ai-explain__analysis">
              {/* Strengths */}
              {explanation.strengths && explanation.strengths.length > 0 && (
                <div className="ai-explain__strengths">
                  <h5>✅ Strengths</h5>
                  <ul>
                    {explanation.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {explanation.improvements && explanation.improvements.length > 0 && (
                <div className="ai-explain__improvements">
                  <h5>💡 Areas for Improvement</h5>
                  <ul>
                    {explanation.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scoring Breakdown */}
              {explanation.scoring && (
                <div className="ai-explain__scoring">
                  <h5>📊 Scoring Breakdown</h5>
                  <div className="ai-explain__scoring-grid">
                    {Object.entries(explanation.scoring).map(([criterion, details]) => (
                      <div key={criterion} className="ai-explain__scoring-item">
                        <div className="ai-explain__scoring-label">
                          {criterion.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="ai-explain__scoring-value">
                          {details.score}/10
                        </div>
                        <div className="ai-explain__scoring-note">
                          {details.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {explanation.suggestions && explanation.suggestions.length > 0 && (
                <div className="ai-explain__suggestions">
                  <h5>💭 Suggestions</h5>
                  <ul>
                    {explanation.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="ai-explain__disclaimer">
          <p>
            <strong>Note:</strong> This AI analysis is provided for educational purposes.
            The scoring and feedback are generated automatically and may not reflect
            all aspects of your answer or the complete evaluation criteria used in
            professional interviews.
          </p>
        </div>
      </div>

      <style jsx>{`
        .ai-explain {
          background: white;
          border: 2px solid #e3f2fd;
          border-radius: 12px;
          margin: 16px 0;
          overflow: hidden;
        }

        .ai-explain__header {
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
          padding: 16px 20px;
        }

        .ai-explain__title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ai-explain__title h3 {
          margin: 0;
          font-size: 18px;
          flex: 1;
        }

        .ai-explain__icon {
          font-size: 20px;
        }

        .ai-explain__close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 16px;
        }

        .ai-explain__close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .ai-explain__score {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-explain__score-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 16px;
        }

        .ai-explain__score-badge--excellent {
          background: #4caf50;
          color: white;
        }

        .ai-explain__score-badge--good {
          background: #ff9800;
          color: white;
        }

        .ai-explain__score-badge--average {
          background: #ffc107;
          color: #333;
        }

        .ai-explain__score-badge--poor {
          background: #f44336;
          color: white;
        }

        .ai-explain__score-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .ai-explain__content {
          padding: 20px;
        }

        .ai-explain__section {
          margin-bottom: 24px;
        }

        .ai-explain__section h4 {
          margin: 0 0 12px 0;
          color: #1976d2;
          font-size: 16px;
          font-weight: 600;
        }

        .ai-explain__question {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          font-style: italic;
        }

        .ai-explain__question-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }

        .ai-explain__difficulty {
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .ai-explain__difficulty--easy {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .ai-explain__difficulty--medium {
          background: #fff3e0;
          color: #ef6c00;
        }

        .ai-explain__difficulty--hard {
          background: #ffebee;
          color: #c62828;
        }

        .ai-explain__category {
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .ai-explain__answer {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #2196f3;
        }

        .ai-explain__expand {
          background: none;
          border: none;
          color: #2196f3;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .ai-explain__loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          color: #666;
        }

        .ai-explain__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e0e0e0;
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ai-explain__error {
          background: #ffebee;
          border: 1px solid #ef5350;
          border-radius: 6px;
          padding: 12px;
          color: #c62828;
        }

        .ai-explain__analysis h5 {
          margin: 16px 0 8px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .ai-explain__strengths {
          background: #e8f5e8;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .ai-explain__strengths h5 {
          color: #2e7d32;
          margin-top: 0;
        }

        .ai-explain__improvements {
          background: #fff3e0;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .ai-explain__improvements h5 {
          color: #ef6c00;
          margin-top: 0;
        }

        .ai-explain__suggestions {
          background: #f3e5f5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .ai-explain__suggestions h5 {
          color: #7b1fa2;
          margin-top: 0;
        }

        .ai-explain__scoring {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .ai-explain__scoring h5 {
          color: #424242;
          margin-top: 0;
        }

        .ai-explain__scoring-grid {
          display: grid;
          gap: 8px;
        }

        .ai-explain__scoring-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
          padding: 8px;
          background: white;
          border-radius: 4px;
        }

        .ai-explain__scoring-label {
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }

        .ai-explain__scoring-value {
          font-size: 14px;
          font-weight: bold;
          color: #2196f3;
        }

        .ai-explain__scoring-note {
          grid-column: 1 / -1;
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .ai-explain__disclaimer {
          background: #e1f5fe;
          border-left: 4px solid #03a9f4;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #0277bd;
        }

        .ai-explain__disclaimer p {
          margin: 0;
        }

        ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        li {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}

function getScoreColor(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'poor';
}

function getScoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Average';
  return 'Needs Improvement';
}
