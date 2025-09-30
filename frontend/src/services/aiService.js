// Enhanced AI service with proper difficulty levels and better grading
const QUESTION_BANK = {
  easy: [
    "What is JSX and how does it differ from regular HTML?",
    "Explain the difference between let, const, and var in JavaScript.",
    "What are React components and what are the two main types?",
    "How do you handle events in React?",
    "What is the purpose of package.json in a Node.js project?"
  ],
  medium: [
    "Explain React's reconciliation process and the virtual DOM.",
    "How would you optimize performance in a React application with a large list?",
    "What are React hooks and why were they introduced?",
    "Explain the concept of middleware in Express.js with an example.",
    "How would you handle asynchronous operations in JavaScript?"
  ],
  hard: [
    "Design a scalable REST API for a social media platform with pagination and filtering.",
    "Explain the event loop in Node.js and how it handles asynchronous operations.",
    "How would you implement authentication and authorization in a full-stack application?",
    "Describe your approach to database design for a real-time chat application.",
    "How would you handle state management in a large React application?"
  ]
};

export async function generateQuestions(candidateProfile = null, sessionId = null) {
  try {
    // If we have a candidate profile, use AI to generate personalized questions
    if (candidateProfile) {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId || Date.now().toString()
        },
        body: JSON.stringify({
          difficulty: 'mixed', // Mix of easy, medium, hard
          count: 6, // Generate 6 questions total
          domain: 'fullstack',
          candidateProfile: candidateProfile
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.questions) {
          // Convert AI questions to match our expected format
          return data.questions.map((q, index) => ({
            id: q.id || `ai_${index + 1}`,
            level: q.difficulty || 'medium',
            text: q.text,
            timeLimit: q.timeLimit || 60,
            maxScore: 100,
            category: q.category || 'General',
            generatedBy: 'ai'
          }));
        }
      }
    }

    // Fallback to static questions if AI fails or no candidate profile
    console.log('Falling back to static questions');
    return generateStaticQuestions();
  } catch (error) {
    console.error('Error generating AI questions:', error);
    return generateStaticQuestions();
  }
}

function generateStaticQuestions() {
function generateStaticQuestions() {
  const questions = [];

  // 2 Easy questions (20 seconds each)
  const easyQuestions = QUESTION_BANK.easy.sort(() => 0.5 - Math.random()).slice(0, 2);
  easyQuestions.forEach((text, index) => {
    questions.push({
      id: `easy_${index + 1}`,
      level: 'easy',
      text,
      timeLimit: 20,
      maxScore: 100
    });
  });

  // 2 Medium questions (60 seconds each)
  const mediumQuestions = QUESTION_BANK.medium.sort(() => 0.5 - Math.random()).slice(0, 2);
  mediumQuestions.forEach((text, index) => {
    questions.push({
      id: `medium_${index + 1}`,
      level: 'medium',
      text,
      timeLimit: 60,
      maxScore: 100
    });
  });

  // 2 Hard questions (120 seconds each)
  const hardQuestions = QUESTION_BANK.hard.sort(() => 0.5 - Math.random()).slice(0, 2);
  hardQuestions.forEach((text, index) => {
    questions.push({
      id: `hard_${index + 1}`,
      level: 'hard',
      text,
      timeLimit: 120,
      maxScore: 100
    });
  });

  return questions;
}
}

export function gradeAnswer(answer, question) {
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      feedback: 'No answer provided.'
    };
  }

  const answerLength = answer.trim().length;
  const wordCount = answer.trim().split(/\s+/).length;

  // Basic scoring based on answer quality indicators
  let score = 0;
  let feedback = '';

  // Length-based scoring
  if (answerLength < 20) {
    score = 10;
    feedback = 'Answer is too short. Please provide more detail.';
  } else if (answerLength < 100) {
    score = 30 + (answerLength - 20) / 2;
    feedback = 'Good start, but could use more explanation.';
  } else if (answerLength < 300) {
    score = 60 + (answerLength - 100) / 5;
    feedback = 'Good detailed answer.';
  } else {
    score = 85;
    feedback = 'Comprehensive and detailed response.';
  }

  // Keyword-based bonus scoring
  const technicalKeywords = [
    'component', 'state', 'props', 'hook', 'useEffect', 'useState',
    'api', 'rest', 'http', 'database', 'async', 'await', 'promise',
    'middleware', 'authentication', 'authorization', 'jwt', 'cors',
    'react', 'node', 'express', 'javascript', 'jsx', 'dom', 'virtual',
    'performance', 'optimization', 'scalability', 'security'
  ];

  const foundKeywords = technicalKeywords.filter(keyword =>
    answer.toLowerCase().includes(keyword.toLowerCase())
  );

  const keywordBonus = Math.min(15, foundKeywords.length * 3);
  score = Math.min(100, score + keywordBonus);

  // Adjust based on question difficulty
  if (question.level === 'easy' && score > 70) {
    score = Math.min(100, score + 10);
  } else if (question.level === 'hard' && score < 50) {
    score = Math.max(score, 40); // Minimum score for attempting hard questions
  }

  // Final feedback adjustment
  if (score >= 85) {
    feedback = 'Excellent answer with good technical depth!';
  } else if (score >= 70) {
    feedback = 'Good answer showing solid understanding.';
  } else if (score >= 50) {
    feedback = 'Adequate answer, but could be improved with more detail.';
  }

  return {
    score: Math.round(score),
    feedback,
    keywordsFound: foundKeywords.length,
    wordCount
  };
}

export function calculateFinalScore(answers) {
  if (!answers || answers.length === 0) return 0;

  const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  const averageScore = totalScore / answers.length;

  return Math.round(averageScore);
}

export function generateSummary(candidate, answers) {
  const finalScore = calculateFinalScore(answers);
  const easyScores = answers.filter((_, i) => i < 2).map(a => a.score);
  const mediumScores = answers.filter((_, i) => i >= 2 && i < 4).map(a => a.score);
  const hardScores = answers.filter((_, i) => i >= 4).map(a => a.score);

  const avgEasy = easyScores.length ? Math.round(easyScores.reduce((a, b) => a + b) / easyScores.length) : 0;
  const avgMedium = mediumScores.length ? Math.round(mediumScores.reduce((a, b) => a + b) / mediumScores.length) : 0;
  const avgHard = hardScores.length ? Math.round(hardScores.reduce((a, b) => a + b) / hardScores.length) : 0;

  let summary = `${candidate.name} completed the full-stack developer assessment with an overall score of ${finalScore}/100. `;

  if (finalScore >= 80) {
    summary += "Excellent performance across all difficulty levels. ";
  } else if (finalScore >= 60) {
    summary += "Good performance with solid technical understanding. ";
  } else {
    summary += "Fair performance with room for improvement. ";
  }

  summary += `Performance breakdown: Easy questions (${avgEasy}/100), Medium questions (${avgMedium}/100), Hard questions (${avgHard}/100). `;

  if (avgHard > avgEasy) {
    summary += "Shows strong problem-solving skills on complex topics.";
  } else if (avgEasy > 80) {
    summary += "Solid foundation in basic concepts.";
  }

  return summary;
}
