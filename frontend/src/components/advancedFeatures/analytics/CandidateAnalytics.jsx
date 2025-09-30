// Candidate analytics dashboard component
import React, { useState, useEffect } from 'react';
import { calculateSessionAnalytics, getAggregatedAnalytics, getCandidateComparison } from '../../../services/analyticsService';

export default function CandidateAnalytics({ sessionId, candidateId }) {
  const [analytics, setAnalytics] = useState(null);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [sessionId, candidateId]);

  const loadAnalytics = async () => {
    setIsLoading(true);

    try {
      // Load session-specific analytics
      if (sessionId) {
        const sessionAnalytics = calculateSessionAnalytics(sessionId);
        setAnalytics(sessionAnalytics);
      }

      // Load aggregated analytics
      const aggregated = getAggregatedAnalytics();
      setAggregatedData(aggregated);

      // Load candidate comparison data
      const comparison = getCandidateComparison();
      setComparisonData(comparison);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="candidate-analytics candidate-analytics--loading">
        <div className="analytics-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="candidate-analytics">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <div className="analytics-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`analytics-tab ${activeTab === 'overview' ? 'analytics-tab--active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`analytics-tab ${activeTab === 'performance' ? 'analytics-tab--active' : ''}`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`analytics-tab ${activeTab === 'comparison' ? 'analytics-tab--active' : ''}`}
          >
            Comparison
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <OverviewTab analytics={analytics} aggregatedData={aggregatedData} />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab analytics={analytics} />
        )}

        {activeTab === 'comparison' && (
          <ComparisonTab comparisonData={comparisonData} />
        )}
      </div>

      <style jsx>{`
        .candidate-analytics {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 16px 0;
        }

        .candidate-analytics--loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          color: #666;
        }

        .analytics-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e0e0e0;
          border-top: 3px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .analytics-header {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .analytics-header h2 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 24px;
        }

        .analytics-tabs {
          display: flex;
          gap: 4px;
        }

        .analytics-tab {
          background: #f5f5f5;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .analytics-tab--active {
          background: #2196f3;
          color: white;
        }

        .analytics-tab:hover:not(.analytics-tab--active) {
          background: #e0e0e0;
        }

        .analytics-content {
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

function OverviewTab({ analytics, aggregatedData }) {
  return (
    <div className="overview-tab">
      {/* Session Overview */}
      {analytics && (
        <div className="analytics-section">
          <h3>Current Session</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{analytics.basic.completionRate}%</div>
              <div className="metric-label">Completion Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.scores.averageScore}</div>
              <div className="metric-label">Average Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{Math.round(analytics.time.totalTimeSpent / 60)}m</div>
              <div className="metric-label">Time Spent</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.basic.answeredQuestions}/{analytics.basic.totalQuestions}</div>
              <div className="metric-label">Questions</div>
            </div>
          </div>
        </div>
      )}

      {/* Aggregated Overview */}
      {aggregatedData && (
        <div className="analytics-section">
          <h3>Overall Statistics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{aggregatedData.overview.totalSessions}</div>
              <div className="metric-label">Total Sessions</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{aggregatedData.overview.totalCandidates}</div>
              <div className="metric-label">Candidates</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{aggregatedData.performance.averageScore}</div>
              <div className="metric-label">Avg Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{Math.round(aggregatedData.time.averageTimePerSession / 60)}m</div>
              <div className="metric-label">Avg Time</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics-section {
          margin-bottom: 32px;
        }

        .analytics-section h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .metric-card {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #2196f3;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}

function PerformanceTab({ analytics }) {
  if (!analytics) {
    return (
      <div className="performance-tab">
        <p>No performance data available.</p>
      </div>
    );
  }

  return (
    <div className="performance-tab">
      {/* Score Analysis */}
      <div className="analytics-section">
        <h3>Score Analysis</h3>
        <div className="score-breakdown">
          <div className="score-item">
            <span>Easy Questions:</span>
            <span className="score-value">{analytics.scores.scoresByDifficulty.Easy}</span>
          </div>
          <div className="score-item">
            <span>Medium Questions:</span>
            <span className="score-value">{analytics.scores.scoresByDifficulty.Medium}</span>
          </div>
          <div className="score-item">
            <span>Hard Questions:</span>
            <span className="score-value">{analytics.scores.scoresByDifficulty.Hard}</span>
          </div>
        </div>
      </div>

      {/* Time Analysis */}
      <div className="analytics-section">
        <h3>Time Analysis</h3>
        <div className="time-breakdown">
          <div className="time-item">
            <span>Time Efficiency:</span>
            <span className="time-value">{analytics.time.timeEfficiency}%</span>
          </div>
          <div className="time-item">
            <span>Avg Time per Question:</span>
            <span className="time-value">{analytics.time.averageTimePerQuestion}s</span>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="analytics-section">
        <h3>Performance Trends</h3>
        <div className="trend-analysis">
          <div className="trend-item">
            <span>Overall Trend:</span>
            <span className={`trend-value trend-value--${analytics.trends.trend}`}>
              {analytics.trends.trend}
            </span>
          </div>
          <div className="trend-item">
            <span>Consistency:</span>
            <span className="trend-value">{analytics.trends.consistency}%</span>
          </div>
          <div className="trend-item">
            <span>Improvement:</span>
            <span className={`trend-value ${analytics.trends.improvement > 0 ? 'trend-value--positive' : 'trend-value--negative'}`}>
              {analytics.trends.improvement > 0 ? '+' : ''}{analytics.trends.improvement}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-section {
          margin-bottom: 32px;
        }

        .analytics-section h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .score-breakdown,
        .time-breakdown,
        .trend-analysis {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
        }

        .score-item,
        .time-item,
        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .score-item:last-child,
        .time-item:last-child,
        .trend-item:last-child {
          border-bottom: none;
        }

        .score-value,
        .time-value,
        .trend-value {
          font-weight: bold;
        }

        .trend-value--improving {
          color: #4caf50;
        }

        .trend-value--declining {
          color: #f44336;
        }

        .trend-value--stable {
          color: #ff9800;
        }

        .trend-value--positive {
          color: #4caf50;
        }

        .trend-value--negative {
          color: #f44336;
        }
      `}</style>
    </div>
  );
}

function ComparisonTab({ comparisonData }) {
  const sortedCandidates = comparisonData.sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="comparison-tab">
      <div className="analytics-section">
        <h3>Candidate Comparison</h3>

        {sortedCandidates.length === 0 ? (
          <p>No candidate data available for comparison.</p>
        ) : (
          <div className="comparison-table">
            <div className="table-header">
              <div>Candidate</div>
              <div>Sessions</div>
              <div>Avg Score</div>
              <div>Best Score</div>
              <div>Total Time</div>
            </div>

            {sortedCandidates.map((candidate, index) => (
              <div key={candidate.candidate.email} className="table-row">
                <div className="candidate-info">
                  <div className="candidate-rank">#{index + 1}</div>
                  <div>
                    <div className="candidate-name">{candidate.candidate.name}</div>
                    <div className="candidate-email">{candidate.candidate.email}</div>
                  </div>
                </div>
                <div>{candidate.completedSessions}/{candidate.sessionsCount}</div>
                <div className="score-cell">
                  <span className={`score-badge score-badge--${getScoreLevel(candidate.averageScore)}`}>
                    {candidate.averageScore}
                  </span>
                </div>
                <div>{candidate.highestScore}</div>
                <div>{Math.round(candidate.totalTimeSpent / 60)}m</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .comparison-table {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 12px 16px;
          align-items: center;
        }

        .table-header {
          background: #f5f5f5;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
        }

        .table-row {
          border-top: 1px solid #f0f0f0;
        }

        .candidate-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .candidate-rank {
          background: #2196f3;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .candidate-name {
          font-weight: 500;
          color: #333;
        }

        .candidate-email {
          font-size: 12px;
          color: #666;
        }

        .score-cell {
          display: flex;
          justify-content: center;
        }

        .score-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .score-badge--excellent {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .score-badge--good {
          background: #fff3e0;
          color: #ef6c00;
        }

        .score-badge--average {
          background: #fff8e1;
          color: #f57f17;
        }

        .score-badge--poor {
          background: #ffebee;
          color: #c62828;
        }
      `}</style>
    </div>
  );
}

function getScoreLevel(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'poor';
}
