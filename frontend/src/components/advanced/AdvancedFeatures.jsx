// Advanced Interview Features
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Voice Input Simulation Component
export const VoiceInputSimulator = ({ onTranscriptionComplete, isListening, onToggleListening }) => {
  const [transcript, setTranscript] = useState('');
  const [simulatedText, setSimulatedText] = useState('');

  const sampleResponses = [
    "React is a JavaScript library for building user interfaces. It differs from traditional web development by using a component-based architecture and virtual DOM for better performance.",
    "The main differences between let, const, and var are their scope and hoisting behavior. Var is function-scoped, while let and const are block-scoped. Const creates immutable bindings.",
    "To optimize performance in React with large lists, I would use React.memo, virtualization libraries like react-window, lazy loading, and proper key props.",
    "React hooks were introduced to allow functional components to use state and lifecycle features that were previously only available in class components.",
    "For a scalable REST API, I would use microservices architecture, implement proper authentication, use caching strategies, database indexing, and API versioning.",
    "For state management in large React applications, I would consider Redux Toolkit, Zustand, or React Context with useReducer, depending on the complexity."
  ];

  const simulateVoiceInput = () => {
    if (!isListening) return;

    const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
    const words = randomResponse.split(' ');
    let currentText = '';

    words.forEach((word, index) => {
      setTimeout(() => {
        currentText += word + ' ';
        setSimulatedText(currentText.trim());

        if (index === words.length - 1) {
          setTimeout(() => {
            onTranscriptionComplete(currentText.trim());
            setSimulatedText('');
          }, 500);
        }
      }, index * 150);
    });
  };

  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(simulateVoiceInput, 1000);
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        background: isListening ? 'linear-gradient(135deg, var(--primary-50), var(--white))' : 'var(--white)',
        border: isListening ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
        marginBottom: 'var(--space-4)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleListening}
          className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
          style={{
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-xl)'
          }}
        >
          {isListening ? '🔴' : '🎤'}
        </motion.button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-600)',
            marginBottom: 'var(--space-1)'
          }}>
            {isListening ? '🎙️ Listening...' : '🎤 Click to start voice input (Simulated)'}
          </div>

          {simulatedText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: 'var(--space-3)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)',
                fontStyle: 'italic',
                color: 'var(--gray-700)'
              }}
            >
              "{simulatedText}"
            </motion.div>
          )}
        </div>
      </div>

      {isListening && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{
              height: '4px',
              background: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              transformOrigin: 'left'
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Real-time Feedback Component
export const RealTimeFeedback = ({ currentAnswer, questionDifficulty }) => {
  const [feedback, setFeedback] = useState(null);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (!currentAnswer || currentAnswer.length < 20) {
      setFeedback(null);
      setConfidence(0);
      return;
    }

    // Simulate real-time AI analysis
    const timer = setTimeout(() => {
      const wordCount = currentAnswer.split(' ').length;
      const hasKeywords = /react|javascript|component|state|performance|api|database|function/i.test(currentAnswer);
      const isDetailed = wordCount > 30;
      const hasExamples = /example|for instance|such as|like/i.test(currentAnswer);

      let score = 50;
      if (hasKeywords) score += 20;
      if (isDetailed) score += 15;
      if (hasExamples) score += 15;

      // Adjust for difficulty
      if (questionDifficulty === 'Hard' && wordCount < 50) score -= 10;
      if (questionDifficulty === 'Easy' && wordCount > 20) score += 5;

      score = Math.min(100, Math.max(0, score));
      setConfidence(score);

      if (score >= 80) {
        setFeedback({
          type: 'excellent',
          message: 'Excellent! Your answer demonstrates strong understanding.',
          suggestions: ['Keep up the detailed explanations!']
        });
      } else if (score >= 65) {
        setFeedback({
          type: 'good',
          message: 'Good progress! Consider adding more specific details.',
          suggestions: ['Try to include concrete examples', 'Explain the technical reasoning']
        });
      } else if (score >= 50) {
        setFeedback({
          type: 'okay',
          message: 'You\'re on the right track. Try to elaborate further.',
          suggestions: ['Add more technical depth', 'Include practical examples', 'Explain the benefits/drawbacks']
        });
      } else {
        setFeedback({
          type: 'needs-improvement',
          message: 'Consider expanding your answer with more details.',
          suggestions: ['Include relevant keywords', 'Provide specific examples', 'Explain your reasoning step-by-step']
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentAnswer, questionDifficulty]);

  if (!feedback) return null;

  const getFeedbackColor = (type) => {
    switch (type) {
      case 'excellent': return 'var(--success)';
      case 'good': return 'var(--info)';
      case 'okay': return 'var(--warning)';
      case 'needs-improvement': return 'var(--error)';
      default: return 'var(--gray-500)';
    }
  };

  const getFeedbackIcon = (type) => {
    switch (type) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'okay': return '💡';
      case 'needs-improvement': return '🎯';
      default: return '💭';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        background: `linear-gradient(135deg, ${getFeedbackColor(feedback.type)}15, var(--white))`,
        border: `2px solid ${getFeedbackColor(feedback.type)}30`,
        marginTop: 'var(--space-4)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{
          fontSize: 'var(--text-2xl)',
          marginTop: 'var(--space-1)'
        }}>
          {getFeedbackIcon(feedback.type)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <h4 style={{ color: getFeedbackColor(feedback.type), margin: 0 }}>
              Real-time AI Feedback
            </h4>
            <div style={{
              padding: 'var(--space-1) var(--space-3)',
              background: `${getFeedbackColor(feedback.type)}20`,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: '700',
              color: getFeedbackColor(feedback.type)
            }}>
              {confidence}% Confidence
            </div>
          </div>

          <p style={{
            marginBottom: 'var(--space-3)',
            color: 'var(--gray-700)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            {feedback.message}
          </p>

          {feedback.suggestions.length > 0 && (
            <div>
              <h5 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--gray-600)',
                marginBottom: 'var(--space-2)'
              }}>
                💡 Suggestions:
              </h5>
              <ul style={{
                margin: 0,
                paddingLeft: 'var(--space-4)',
                color: 'var(--gray-600)',
                fontSize: 'var(--text-sm)'
              }}>
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index} style={{ marginBottom: 'var(--space-1)' }}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Progress Tracker Component
export const ProgressTracker = ({ currentQuestion, totalQuestions, answers, timeRemaining }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const completedQuestions = answers.length;
  const averageScore = answers.length > 0
    ? answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
      style={{ marginBottom: 'var(--space-6)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ color: 'var(--gray-900)', margin: 0 }}>📊 Interview Progress</h3>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
          Question {currentQuestion} of {totalQuestions}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ height: '12px', marginBottom: 'var(--space-4)' }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '800',
            color: 'var(--primary)'
          }}>
            {completedQuestions}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Completed
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '800',
            color: averageScore >= 80 ? 'var(--success)' : averageScore >= 60 ? 'var(--warning)' : 'var(--error)'
          }}>
            {Math.round(averageScore)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Avg Score
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '800',
            color: timeRemaining <= 10 ? 'var(--error)' : 'var(--gray-700)'
          }}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Time Left
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '800',
            color: 'var(--info)'
          }}>
            {Math.round(progress)}%
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Complete
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Notification System
export const NotificationSystem = ({ notifications, onDismiss }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: 'var(--space-6)',
      zIndex: 'var(--z-tooltip)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      maxWidth: '400px'
    }}>
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="card"
          style={{
            background: notification.type === 'success' ? 'var(--success-light)' :
                       notification.type === 'warning' ? 'var(--warning-light)' :
                       notification.type === 'error' ? 'var(--error-light)' : 'var(--info-light)',
            border: `2px solid ${notification.type === 'success' ? 'var(--success)' :
                                 notification.type === 'warning' ? 'var(--warning)' :
                                 notification.type === 'error' ? 'var(--error)' : 'var(--info)'}`,
            cursor: 'pointer'
          }}
          onClick={() => onDismiss(notification.id)}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--text-xl)' }}>
              {notification.type === 'success' ? '✅' :
               notification.type === 'warning' ? '⚠️' :
               notification.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                {notification.title}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                {notification.message}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
