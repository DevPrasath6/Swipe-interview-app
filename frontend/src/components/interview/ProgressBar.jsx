import React from 'react';

export default function ProgressBar({
  currentStep,
  totalSteps,
  questions = [],
  answers = []
}) {
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getQuestionDifficulty = (index) => {
    if (!questions[index]) return 'unknown';
    return questions[index].level;
  };

  const getDifficultyIcon = (level) => {
    switch (level) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getStepScore = (index) => {
    const answer = answers[index];
    return answer ? answer.score : null;
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h4>Interview Progress</h4>
        <span className="progress-counter">
          {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${((currentStep) / (totalSteps - 1)) * 100}%`
            }}
          />
        </div>

        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, index) => {
            const status = getStepStatus(index);
            const difficulty = getQuestionDifficulty(index);
            const score = getStepScore(index);

            return (
              <div
                key={index}
                className={`progress-step ${status}`}
                title={`Question ${index + 1} (${difficulty})`}
              >
                <div className="step-marker">
                  {status === 'completed' ? (
                    <span className="step-check">✓</span>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>

                <div className="step-info">
                  <div className="step-difficulty">
                    {getDifficultyIcon(difficulty)}
                  </div>
                  {score !== null && (
                    <div className="step-score">
                      {score}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="progress-legend">
        <div className="legend-item">
          <span className="legend-icon">🟢</span>
          <span className="legend-text">Easy (20s)</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🟡</span>
          <span className="legend-text">Medium (60s)</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🔴</span>
          <span className="legend-text">Hard (120s)</span>
        </div>
      </div>
    </div>
  );
}
