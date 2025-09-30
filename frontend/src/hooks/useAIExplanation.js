import { useState, useCallback } from 'react';

export default function useAIExplanation() {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  const generateExplanation = useCallback(async (answer, question, score) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate AI explanation generation based on the answer and score
      const explanationText = await generateAIExplanation(answer, question, score);
      setExplanation(explanationText);
      return explanationText;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate explanation';
      setError(errorMessage);
      console.error('AI explanation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setExplanation(null);
    setError(null);
  }, []);

  return {
    loading,
    explanation,
    error,
    generateExplanation,
    reset
  };
}

// Helper function to generate AI explanations
async function generateAIExplanation(answer, question, score) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const answerLength = answer?.trim().length || 0;
  const hasKeywords = checkForTechnicalKeywords(answer);

  let explanation = '';

  if (score >= 80) {
    explanation = `Excellent answer! You demonstrated strong understanding of the topic with ${
      hasKeywords ? 'relevant technical terminology' : 'clear explanations'
    }. Your response was comprehensive (${answerLength} characters) and showed depth of knowledge.`;
  } else if (score >= 60) {
    explanation = `Good answer with solid fundamentals. ${
      answerLength < 100
        ? 'Consider providing more detail and examples to strengthen your response.'
        : 'Your explanation covers the key concepts well.'
    } ${
      hasKeywords
        ? 'Good use of technical terminology.'
        : 'Try incorporating more specific technical terms.'
    }`;
  } else if (score >= 40) {
    explanation = `Your answer shows basic understanding but needs improvement. ${
      answerLength < 50
        ? 'Provide more detailed explanations with examples.'
        : 'Focus on accuracy and technical depth.'
    } Consider researching the topic further and practicing similar questions.`;
  } else {
    explanation = `This answer needs significant improvement. ${
      answerLength < 20
        ? 'Your response was too brief - aim for more comprehensive explanations.'
        : 'Focus on understanding the core concepts.'
    } Consider studying the fundamentals and practicing with similar questions.`;
  }

  // Add question-specific guidance
  if (question?.level === 'hard') {
    explanation += ' For advanced questions like this, demonstrate system design thinking and consider scalability, performance, and best practices.';
  } else if (question?.level === 'medium') {
    explanation += ' For intermediate questions, balance theoretical knowledge with practical implementation details.';
  } else if (question?.level === 'easy') {
    explanation += ' For foundational questions, ensure you cover the basic concepts clearly and accurately.';
  }

  return explanation;
}

function checkForTechnicalKeywords(answer) {
  if (!answer) return false;

  const keywords = [
    'component', 'state', 'props', 'hook', 'useEffect', 'useState',
    'api', 'rest', 'http', 'database', 'async', 'await', 'promise',
    'middleware', 'authentication', 'authorization', 'jwt', 'cors',
    'react', 'node', 'express', 'javascript', 'jsx', 'dom', 'virtual',
    'performance', 'optimization', 'scalability', 'security'
  ];

  const lowerAnswer = answer.toLowerCase();
  return keywords.some(keyword => lowerAnswer.includes(keyword));
}
