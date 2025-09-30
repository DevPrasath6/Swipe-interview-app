// Advanced Analytics Dashboard Components
import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Performance Metrics Component
export const PerformanceMetrics = ({ candidates = [] }) => {
  const averageScore = candidates.length > 0
    ? candidates.reduce((sum, candidate) => sum + candidate.score, 0) / candidates.length
    : 0;

  const completionRate = candidates.length > 0
    ? (candidates.filter(c => c.status === 'completed').length / candidates.length) * 100
    : 0;

  const topPerformer = candidates.length > 0
    ? candidates.reduce((max, candidate) => candidate.score > max.score ? candidate : max, candidates[0])
    : null;

  const metrics = [
    {
      title: 'Average Score',
      value: Math.round(averageScore),
      unit: '/100',
      color: 'var(--primary)',
      icon: '📊',
      trend: '+5.2%'
    },
    {
      title: 'Completion Rate',
      value: Math.round(completionRate),
      unit: '%',
      color: 'var(--success)',
      icon: '✅',
      trend: '+12.3%'
    },
    {
      title: 'Total Interviews',
      value: candidates.length,
      unit: '',
      color: 'var(--info)',
      icon: '👥',
      trend: '+8'
    },
    {
      title: 'Top Score',
      value: topPerformer ? topPerformer.score : 0,
      unit: '/100',
      color: 'var(--warning)',
      icon: '🏆',
      trend: 'New!'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'var(--space-6)',
      marginBottom: 'var(--space-8)'
    }}>
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
          style={{
            background: `linear-gradient(135deg, ${metric.color}15, var(--white))`,
            border: `1px solid ${metric.color}30`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '60px',
            height: '60px',
            background: `${metric.color}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-2xl)'
          }}>
            {metric.icon}
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h4 style={{
              color: 'var(--gray-600)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {metric.title}
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '800',
              color: metric.color
            }}>
              {metric.value}
            </span>
            <span style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--gray-500)',
              fontWeight: '600'
            }}>
              {metric.unit}
            </span>
          </div>

          <div style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-1) var(--space-2)',
            background: `${metric.color}10`,
            borderRadius: 'var(--radius)',
            display: 'inline-block'
          }}>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: metric.color,
              fontWeight: '600'
            }}>
              {metric.trend}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Score Distribution Chart
export const ScoreDistributionChart = ({ candidates = [] }) => {
  const scoreRanges = {
    '90-100': candidates.filter(c => c.score >= 90).length,
    '80-89': candidates.filter(c => c.score >= 80 && c.score < 90).length,
    '70-79': candidates.filter(c => c.score >= 70 && c.score < 80).length,
    '60-69': candidates.filter(c => c.score >= 60 && c.score < 70).length,
    '0-59': candidates.filter(c => c.score < 60).length,
  };

  const data = {
    labels: Object.keys(scoreRanges),
    datasets: [{
      label: 'Number of Candidates',
      data: Object.values(scoreRanges),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(107, 114, 128, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Score Distribution',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} candidates`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{ marginBottom: 'var(--space-6)' }}
    >
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-900)' }}>
        📊 Performance Distribution
      </h3>
      <Bar data={data} options={options} />
    </motion.div>
  );
};

// Difficulty Performance Chart
export const DifficultyPerformanceChart = ({ candidates = [] }) => {
  const difficultyScores = {
    easy: [],
    medium: [],
    hard: []
  };

  candidates.forEach(candidate => {
    if (candidate.answers) {
      candidate.answers.forEach(answer => {
        if (answer.difficulty) {
          difficultyScores[answer.difficulty.toLowerCase()]?.push(answer.score);
        }
      });
    }
  });

  const averageScores = {
    easy: difficultyScores.easy.length > 0
      ? difficultyScores.easy.reduce((sum, score) => sum + score, 0) / difficultyScores.easy.length
      : 0,
    medium: difficultyScores.medium.length > 0
      ? difficultyScores.medium.reduce((sum, score) => sum + score, 0) / difficultyScores.medium.length
      : 0,
    hard: difficultyScores.hard.length > 0
      ? difficultyScores.hard.reduce((sum, score) => sum + score, 0) / difficultyScores.hard.length
      : 0
  };

  const data = {
    labels: ['Easy Questions', 'Medium Questions', 'Hard Questions'],
    datasets: [{
      label: 'Average Score',
      data: [averageScores.easy, averageScores.medium, averageScores.hard],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointRadius: 6,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Performance by Difficulty Level',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{ marginBottom: 'var(--space-6)' }}
    >
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-900)' }}>
        📈 Difficulty Analysis
      </h3>
      <Line data={data} options={options} />
    </motion.div>
  );
};

// AI Recommendation Breakdown
export const AIRecommendationBreakdown = ({ candidates = [] }) => {
  const recommendations = candidates.reduce((acc, candidate) => {
    if (candidate.aiSummary?.recommendation) {
      acc[candidate.aiSummary.recommendation] = (acc[candidate.aiSummary.recommendation] || 0) + 1;
    }
    return acc;
  }, {});

  const data = {
    labels: Object.keys(recommendations).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [{
      data: Object.values(recommendations),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'AI Recommendations',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{ marginBottom: 'var(--space-6)' }}
    >
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-900)' }}>
        🤖 AI Assessment Summary
      </h3>
      <div style={{ maxWidth: '300px', margin: '0 auto' }}>
        <Doughnut data={data} options={options} />
      </div>
    </motion.div>
  );
};

// Real-time Activity Feed
export const ActivityFeed = ({ candidates = [] }) => {
  const recentActivities = candidates
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5)
    .map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      action: 'completed interview',
      time: candidate.completedAt,
      score: candidate.score,
      status: candidate.status
    }));

  const getActivityIcon = (score) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '🎯';
    if (score >= 70) return '👍';
    return '📝';
  };

  const getTimeAgo = (timestamp) => {
    const diff = new Date() - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-900)' }}>
        📡 Recent Activity
      </h3>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {recentActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-2)',
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)'
            }}
          >
            <div style={{ fontSize: 'var(--text-xl)' }}>
              {getActivityIcon(activity.score)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'var(--gray-900)' }}>
                {activity.name}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                {activity.action} • Score: {activity.score}/100
              </div>
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--gray-500)',
              textAlign: 'right'
            }}>
              {getTimeAgo(activity.time)}
            </div>
          </motion.div>
        ))}
        {recentActivities.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'var(--gray-500)',
            padding: 'var(--space-8)'
          }}>
            No recent activity
          </div>
        )}
      </div>
    </motion.div>
  );
};
