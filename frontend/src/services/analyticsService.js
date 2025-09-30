// Analytics service for tracking interview metrics and performance
import { getCurrentSession, getAllSessions, getAllCandidates } from './persistence';

/**
 * Calculate session analytics
 */
export function calculateSessionAnalytics(sessionId) {
  const session = getCurrentSession();
  const allSessions = getAllSessions();

  const targetSession = sessionId
    ? allSessions.find(s => s.id === sessionId) || session
    : session;

  if (!targetSession || !targetSession.questions || targetSession.questions.length === 0) {
    return getEmptyAnalytics();
  }

  const questions = targetSession.questions;
  const answers = targetSession.answers || [];

  // Basic metrics
  const totalQuestions = questions.length;
  const answeredQuestions = answers.length;
  const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Time metrics
  const timeMetrics = calculateTimeMetrics(questions, answers);

  // Score metrics
  const scoreMetrics = calculateScoreMetrics(answers);

  // Difficulty analysis
  const difficultyAnalysis = calculateDifficultyAnalysis(questions, answers);

  // Performance trends
  const performanceTrends = calculatePerformanceTrends(answers);

  return {
    session: {
      id: targetSession.id,
      candidateName: targetSession.candidateName,
      status: targetSession.status,
      createdAt: targetSession.createdAt,
      completedAt: targetSession.completedAt
    },
    basic: {
      totalQuestions,
      answeredQuestions,
      completionRate: Math.round(completionRate * 100) / 100,
      status: getSessionStatus(targetSession)
    },
    time: timeMetrics,
    scores: scoreMetrics,
    difficulty: difficultyAnalysis,
    trends: performanceTrends
  };
}

/**
 * Calculate time-related metrics
 */
function calculateTimeMetrics(questions, answers) {
  if (answers.length === 0) {
    return {
      totalTimeSpent: 0,
      averageTimePerQuestion: 0,
      timeByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      timeEfficiency: 0
    };
  }

  const totalTimeSpent = answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);
  const averageTimePerQuestion = totalTimeSpent / answers.length;

  // Time by difficulty
  const timeByDifficulty = { Easy: [], Medium: [], Hard: [] };

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.difficulty) {
      timeByDifficulty[question.difficulty].push(answer.timeSpent || 0);
    }
  });

  const avgTimeByDifficulty = {
    Easy: calculateAverage(timeByDifficulty.Easy),
    Medium: calculateAverage(timeByDifficulty.Medium),
    Hard: calculateAverage(timeByDifficulty.Hard)
  };

  // Time efficiency (comparing actual vs allocated time)
  const totalAllocatedTime = questions.reduce((total, q) => {
    const timeLimit = q.difficulty === 'Easy' ? 20 : q.difficulty === 'Medium' ? 60 : 120;
    return total + timeLimit;
  }, 0);

  const timeEfficiency = totalAllocatedTime > 0 ? (totalTimeSpent / totalAllocatedTime) * 100 : 0;

  return {
    totalTimeSpent: Math.round(totalTimeSpent),
    averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
    timeByDifficulty: avgTimeByDifficulty,
    timeEfficiency: Math.round(timeEfficiency * 100) / 100,
    totalAllocatedTime: Math.round(totalAllocatedTime)
  };
}

/**
 * Calculate score-related metrics
 */
function calculateScoreMetrics(answers) {
  if (answers.length === 0) {
    return {
      totalScore: 0,
      averageScore: 0,
      scoresByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      scoreDistribution: { Excellent: 0, Good: 0, Average: 0, Poor: 0 },
      passingGrade: false
    };
  }

  const scores = answers.map(a => a.score || 0);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / answers.length;

  // Scores by difficulty (need to match with questions)
  const scoresByDifficulty = { Easy: [], Medium: [], Hard: [] };

  answers.forEach(answer => {
    if (answer.questionDifficulty && typeof answer.score === 'number') {
      scoresByDifficulty[answer.questionDifficulty].push(answer.score);
    }
  });

  const avgScoresByDifficulty = {
    Easy: calculateAverage(scoresByDifficulty.Easy),
    Medium: calculateAverage(scoresByDifficulty.Medium),
    Hard: calculateAverage(scoresByDifficulty.Hard)
  };

  // Score distribution
  const scoreDistribution = { Excellent: 0, Good: 0, Average: 0, Poor: 0 };
  answers.forEach(answer => {
    const score = answer.score || 0;
    if (score >= 90) scoreDistribution.Excellent++;
    else if (score >= 75) scoreDistribution.Good++;
    else if (score >= 60) scoreDistribution.Average++;
    else scoreDistribution.Poor++;
  });

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
    scoresByDifficulty: avgScoresByDifficulty,
    scoreDistribution,
    passingGrade: averageScore >= 70,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores)
  };
}

/**
 * Calculate difficulty-based analysis
 */
function calculateDifficultyAnalysis(questions, answers) {
  const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
  const correctByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };

  questions.forEach(question => {
    if (question.difficulty) {
      difficulties[question.difficulty]++;
    }
  });

  answers.forEach(answer => {
    if (answer.questionDifficulty) {
      if (answer.score && answer.score >= 70) {
        correctByDifficulty[answer.questionDifficulty]++;
      }
    }
  });

  const accuracyByDifficulty = {
    Easy: difficulties.Easy > 0 ? (correctByDifficulty.Easy / difficulties.Easy) * 100 : 0,
    Medium: difficulties.Medium > 0 ? (correctByDifficulty.Medium / difficulties.Medium) * 100 : 0,
    Hard: difficulties.Hard > 0 ? (correctByDifficulty.Hard / difficulties.Hard) * 100 : 0
  };

  return {
    questionCount: difficulties,
    correctAnswers: correctByDifficulty,
    accuracy: {
      Easy: Math.round(accuracyByDifficulty.Easy * 100) / 100,
      Medium: Math.round(accuracyByDifficulty.Medium * 100) / 100,
      Hard: Math.round(accuracyByDifficulty.Hard * 100) / 100
    }
  };
}

/**
 * Calculate performance trends
 */
function calculatePerformanceTrends(answers) {
  if (answers.length < 2) {
    return {
      trend: 'insufficient_data',
      improvement: 0,
      consistency: 0,
      momentum: 'stable'
    };
  }

  const scores = answers.map(a => a.score || 0);
  const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
  const secondHalf = scores.slice(Math.ceil(scores.length / 2));

  const firstHalfAvg = calculateAverage(firstHalf);
  const secondHalfAvg = calculateAverage(secondHalf);

  const improvement = secondHalfAvg - firstHalfAvg;

  // Calculate consistency (lower standard deviation = more consistent)
  const avgScore = calculateAverage(scores);
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - standardDeviation);

  // Determine momentum
  let momentum = 'stable';
  if (improvement > 10) momentum = 'improving';
  else if (improvement < -10) momentum = 'declining';

  return {
    trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable',
    improvement: Math.round(improvement * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    momentum,
    firstHalfAverage: Math.round(firstHalfAvg * 100) / 100,
    secondHalfAverage: Math.round(secondHalfAvg * 100) / 100
  };
}

/**
 * Get aggregated analytics across all sessions
 */
export function getAggregatedAnalytics() {
  const allSessions = getAllSessions();
  const allCandidates = getAllCandidates();

  if (allSessions.length === 0) {
    return getEmptyAggregatedAnalytics();
  }

  const completedSessions = allSessions.filter(s => s.status === 'completed');
  const totalSessions = allSessions.length;
  const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;

  // Calculate aggregate scores
  const allAnswers = completedSessions.flatMap(s => s.answers || []);
  const allScores = allAnswers.map(a => a.score || 0);

  const averageScore = calculateAverage(allScores);
  const scoreDistribution = calculateScoreDistribution(allScores);

  // Time analytics
  const totalTimeSpent = allAnswers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
  const averageTimePerSession = completedSessions.length > 0 ? totalTimeSpent / completedSessions.length : 0;

  return {
    overview: {
      totalSessions,
      completedSessions: completedSessions.length,
      completionRate: Math.round(completionRate * 100) / 100,
      totalCandidates: allCandidates.length
    },
    performance: {
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: allScores.length > 0 ? Math.max(...allScores) : 0,
      lowestScore: allScores.length > 0 ? Math.min(...allScores) : 0,
      scoreDistribution
    },
    time: {
      totalTimeSpent: Math.round(totalTimeSpent),
      averageTimePerSession: Math.round(averageTimePerSession * 100) / 100,
      totalQuestions: allAnswers.length
    }
  };
}

/**
 * Get candidate comparison analytics
 */
export function getCandidateComparison() {
  const allCandidates = getAllCandidates();
  const allSessions = getAllSessions();

  return allCandidates.map(candidate => {
    const candidateSessions = allSessions.filter(s => s.candidateEmail === candidate.email);
    const completedSessions = candidateSessions.filter(s => s.status === 'completed');

    if (completedSessions.length === 0) {
      return {
        candidate,
        sessionsCount: candidateSessions.length,
        completedSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        lastSessionDate: candidateSessions.length > 0 ? Math.max(...candidateSessions.map(s => s.createdAt)) : null
      };
    }

    const allAnswers = completedSessions.flatMap(s => s.answers || []);
    const allScores = allAnswers.map(a => a.score || 0);
    const averageScore = calculateAverage(allScores);
    const totalTimeSpent = allAnswers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);

    return {
      candidate,
      sessionsCount: candidateSessions.length,
      completedSessions: completedSessions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: allScores.length > 0 ? Math.max(...allScores) : 0,
      totalTimeSpent: Math.round(totalTimeSpent),
      lastSessionDate: Math.max(...candidateSessions.map(s => s.createdAt))
    };
  });
}

/**
 * Helper functions
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

function calculateScoreDistribution(scores) {
  const distribution = { Excellent: 0, Good: 0, Average: 0, Poor: 0 };

  scores.forEach(score => {
    if (score >= 90) distribution.Excellent++;
    else if (score >= 75) distribution.Good++;
    else if (score >= 60) distribution.Average++;
    else distribution.Poor++;
  });

  return distribution;
}

function getSessionStatus(session) {
  if (!session) return 'unknown';
  if (session.status === 'completed') return 'completed';
  if (session.questions && session.questions.length > 0) return 'in_progress';
  return 'not_started';
}

function getEmptyAnalytics() {
  return {
    session: null,
    basic: {
      totalQuestions: 0,
      answeredQuestions: 0,
      completionRate: 0,
      status: 'not_started'
    },
    time: {
      totalTimeSpent: 0,
      averageTimePerQuestion: 0,
      timeByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      timeEfficiency: 0
    },
    scores: {
      totalScore: 0,
      averageScore: 0,
      scoresByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      scoreDistribution: { Excellent: 0, Good: 0, Average: 0, Poor: 0 },
      passingGrade: false
    },
    difficulty: {
      questionCount: { Easy: 0, Medium: 0, Hard: 0 },
      correctAnswers: { Easy: 0, Medium: 0, Hard: 0 },
      accuracy: { Easy: 0, Medium: 0, Hard: 0 }
    },
    trends: {
      trend: 'insufficient_data',
      improvement: 0,
      consistency: 0,
      momentum: 'stable'
    }
  };
}

function getEmptyAggregatedAnalytics() {
  return {
    overview: {
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      totalCandidates: 0
    },
    performance: {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      scoreDistribution: { Excellent: 0, Good: 0, Average: 0, Poor: 0 }
    },
    time: {
      totalTimeSpent: 0,
      averageTimePerSession: 0,
      totalQuestions: 0
    }
  };
}
