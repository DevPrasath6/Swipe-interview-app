// AI Controller for question generation and grading
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');

// Store used questions per session to prevent repetition
const sessionQuestions = new Map();

export const generate = async (req, res) => {
  try {
    const { difficulty, count = 1, domain = 'fullstack', candidateProfile } = req.body;
    const sessionId = req.headers['session-id'] || 'default';

    // Initialize session if doesn't exist
    if (!sessionQuestions.has(sessionId)) {
      sessionQuestions.set(sessionId, new Set());
    }
    const usedQuestions = sessionQuestions.get(sessionId);

    // If no API key configured, fall back to mock questions
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return generateMockQuestions(req, res);
    }

    // Create detailed prompt with candidate analysis
    const candidateAnalysis = candidateProfile ? `
CANDIDATE ANALYSIS:
- Name: ${candidateProfile.name || 'N/A'}
- Skills: ${candidateProfile.skills?.join(', ') || 'N/A'}
- Experience: ${candidateProfile.experience?.map(exp => exp.title || exp).join(', ') || 'N/A'}
- Education: ${candidateProfile.education?.map(edu => edu.degree || edu).join(', ') || 'N/A'}

INSTRUCTIONS:
- Analyze the candidate's background carefully
- Generate questions that test skills they claim to have
- For React developers, ask about hooks, state management, performance
- For Node.js experience, ask about APIs, middleware, databases
- Match question complexity to their experience level
- Avoid generic questions - make them specific to their backgroundPreviously used questions in this session: ${Array.from(usedQuestions).slice(-5).join('; ')}
IMPORTANT: Generate completely different questions, do not repeat any content from previous questions.
` : '';

    const difficultyInstruction = difficulty === 'mixed'
      ? 'Mix of difficulty levels: 2 easy (20-30s), 2 medium (60-90s), 2 hard (120-180s)'
      : `${difficulty} difficulty level (Easy: 20-30s, Medium: 60-90s, Hard: 120-180s)`;

    const prompt = `You are an expert technical interviewer. Generate ${count} unique interview questions for a Full Stack Developer position.

${candidateAnalysis}

REQUIREMENTS:
- ${difficultyInstruction}
- Questions must be specific to the candidate's actual skills and experience
- Test practical knowledge, not just theory
- Include scenario-based questions when appropriate
- Ensure questions are unique and not repetitive

Return ONLY a valid JSON array in this exact format:
[{"text": "Your question here?", "difficulty": "easy|medium|hard", "category": "React|Node.js|JavaScript|Database|System Design"}]`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call Gemini - wrap in try/catch so we can log helpful debug info in development
    let content;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      content = response.text();
    } catch (apiError) {
      console.error('Gemini API error when generating questions:', apiError);
      // In development return error details to simplify debugging; otherwise fallback to mock
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ error: 'Gemini API error', details: apiError.message || String(apiError) });
      }
      return generateMockQuestions(req, res);
    }

    let aiQuestions;
    try {
      // Extract JSON from response (remove any markdown formatting)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiQuestions = JSON.parse(jsonMatch[0]);
      } else {
        aiQuestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', content);
      return generateMockQuestions(req, res);
    }

    // Filter out questions that are too similar to used ones
    const freshQuestions = aiQuestions.filter(q => {
      const questionWords = q.text.toLowerCase().split(' ');
      return !Array.from(usedQuestions).some(usedQ => {
        const usedWords = usedQ.toLowerCase().split(' ');
        const commonWords = questionWords.filter(word => usedWords.includes(word));
        return commonWords.length > 3; // If more than 3 words match, consider it similar
      });
    });

    const questions = (freshQuestions.length > 0 ? freshQuestions : aiQuestions).slice(0, count).map((q, index) => {
      const questionText = q.text || q;
      const questionDifficulty = q.difficulty || difficulty;
      usedQuestions.add(questionText); // Track used questions

      return {
        id: Date.now() + index,
        text: questionText,
        difficulty: questionDifficulty,
        timeLimit: questionDifficulty === 'easy' ? 30 : questionDifficulty === 'medium' ? 90 : 180,
        category: q.category || 'General',
        generatedBy: 'gemini-ai'
      };
    });

    res.json({
      success: true,
      questions: questions.slice(0, count),
      metadata: { difficulty, count, domain, generatedBy: 'Gemini' }
    });
  } catch (error) {
    console.error('AI question generation error:', error);

    // Fallback to mock questions if AI fails
    if (error.code === 'invalid_api_key' || error.status === 401) {
      console.warn('Invalid OpenAI API key, falling back to mock questions');
      return generateMockQuestions(req, res);
    }

    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

function generateMockQuestions(req, res) {
  const { difficulty, count = 1, domain = 'general', candidateProfile } = req.body;
  const sessionId = req.headers['session-id'] || 'default';

  // Initialize session if doesn't exist
  if (!sessionQuestions.has(sessionId)) {
    sessionQuestions.set(sessionId, new Set());
  }
  const usedQuestions = sessionQuestions.get(sessionId);

  // Enhanced question pool with more variety
  const questionPool = {
    easy: [
      { text: "What is React and how does it differ from traditional web development?", category: "React", keywords: ["react", "frontend"] },
      { text: "Explain the difference between let, const, and var in JavaScript.", category: "JavaScript", keywords: ["javascript", "js"] },
      { text: "What is the purpose of the 'key' prop in React lists?", category: "React", keywords: ["react", "frontend"] },
      { text: "Describe what HTML semantic elements are and give examples.", category: "Frontend", keywords: ["html", "frontend"] },
      { text: "What is CSS flexbox and how do you use it?", category: "CSS", keywords: ["css", "styling", "frontend"] },
      { text: "Explain what Node.js is and why it's useful.", category: "Node.js", keywords: ["node", "nodejs", "backend"] },
      { text: "What is the difference between == and === in JavaScript?", category: "JavaScript", keywords: ["javascript", "js"] },
      { text: "What are props in React?", category: "React", keywords: ["react", "frontend"] }
    ],
    medium: [
      { text: "How would you optimize performance in a React application with a large list?", category: "React", keywords: ["react", "performance"] },
      { text: "What are React hooks and why were they introduced?", category: "React", keywords: ["react", "hooks"] },
      { text: "Explain the concept of closures in JavaScript with an example.", category: "JavaScript", keywords: ["javascript", "js", "closures"] },
      { text: "What is the difference between SQL and NoSQL databases?", category: "Database", keywords: ["database", "sql", "nosql"] },
      { text: "How do you handle asynchronous operations in JavaScript?", category: "JavaScript", keywords: ["javascript", "async", "promises"] },
      { text: "Explain the concept of middleware in Express.js.", category: "Node.js", keywords: ["express", "nodejs", "middleware"] },
      { text: "What is state management in React and when would you use it?", category: "React", keywords: ["react", "state", "redux"] },
      { text: "How do you ensure security in a Node.js application?", category: "Node.js", keywords: ["nodejs", "security", "backend"] }
    ],
    hard: [
      { text: "Design a scalable REST API for a social media platform.", category: "System Design", keywords: ["api", "system", "design", "scalability"] },
      { text: "How would you handle state management in a large React application?", category: "React", keywords: ["react", "state", "architecture"] },
      { text: "Implement a debounce function from scratch in JavaScript.", category: "JavaScript", keywords: ["javascript", "performance", "algorithms"] },
      { text: "Explain microservices architecture and its trade-offs.", category: "System Design", keywords: ["microservices", "architecture", "backend"] },
      { text: "How would you implement real-time features in a web application?", category: "System Design", keywords: ["realtime", "websockets", "backend"] },
      { text: "Design a caching strategy for a high-traffic web application.", category: "System Design", keywords: ["caching", "performance", "backend"] },
      { text: "How would you optimize database queries for better performance?", category: "Database", keywords: ["database", "optimization", "sql"] },
      { text: "Explain how you would implement authentication and authorization.", category: "Security", keywords: ["auth", "security", "backend"] }
    ]
  };

  let availableQuestions = questionPool[difficulty] || questionPool.medium;

  // Filter questions based on candidate profile if available
  if (candidateProfile && candidateProfile.skills && candidateProfile.skills.length > 0) {
    const candidateSkills = candidateProfile.skills.map(skill => skill.toLowerCase());

    // Prioritize questions matching candidate's skills
    const matchingQuestions = availableQuestions.filter(q =>
      q.keywords.some(keyword => candidateSkills.some(skill => skill.includes(keyword)))
    );

    if (matchingQuestions.length >= count) {
      availableQuestions = matchingQuestions;
    }
  }

  // Filter out already used questions
  const freshQuestions = availableQuestions.filter(q => !usedQuestions.has(q.text));

  // If we've used all questions, reset the session
  if (freshQuestions.length === 0) {
    usedQuestions.clear();
    availableQuestions = questionPool[difficulty] || questionPool.medium;
  } else {
    availableQuestions = freshQuestions;
  }

  // Select random questions
  const selectedQuestions = availableQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, availableQuestions.length))
    .map((q, index) => {
      // Mark question as used
      usedQuestions.add(q.text);

      return {
        id: Date.now() + index,
        text: q.text,
        difficulty,
        timeLimit: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 120,
        category: q.category,
        generatedBy: 'mock-tailored'
      };
    });

  res.json({
    success: true,
    questions: selectedQuestions,
    metadata: {
      difficulty,
      count,
      domain,
      generatedBy: 'Mock (Tailored)',
      candidateSkills: candidateProfile?.skills || [],
      questionsUsed: usedQuestions.size
    }
  });
}

function extractQuestionsFromText(text) {
  // Extract questions from AI response even if not valid JSON
  const lines = text.split('\n').filter(line => line.trim());
  const questions = [];

  for (const line of lines) {
    if (line.includes('?') && line.length > 20) {
      const cleanQuestion = line.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '').trim();
      if (cleanQuestion.length > 10) {
        questions.push({ text: cleanQuestion, category: 'General' });
      }
    }
  }

  return questions;
}

export const grade = async (req, res) => {
  try {
    const { question, answer, difficulty, candidateProfile } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    // If no API key configured, fall back to mock grading
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return gradeMockAnswer(req, res);
    }

    const prompt = `Grade this interview answer on a scale of 0-100:

Question: "${question}"
Answer: "${answer}"
Difficulty: ${difficulty}
${candidateProfile ? `Candidate Background: ${candidateProfile.skills?.join(', ') || 'N/A'}` : ''}

Provide:
1. Score (0-100)
2. Brief feedback (2-3 sentences)
3. Key strengths
4. Areas for improvement

Format as JSON:
{
  "score": number,
  "feedback": "string",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    let grading;
    try {
      grading = JSON.parse(responseText);
    } catch (parseError) {
      // Extract score from text if JSON parsing fails
      const scoreMatch = responseText.match(/score[:\s]*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 30) + 70;

      grading = {
        score: Math.min(100, Math.max(0, score)),
        feedback: responseText.substring(0, 200) + '...',
        strengths: ['Good technical understanding'],
        improvements: ['Could provide more specific examples']
      };
    }

    res.json({
      success: true,
      grading: {
        score: Math.min(100, Math.max(0, grading.score)),
        feedback: grading.feedback,
        strengths: grading.strengths || [],
        improvements: grading.improvements || [],
        gradedBy: 'ai'
      }
    });
  } catch (error) {
    console.error('AI grading error:', error);

    // Fallback to mock grading if AI fails
    if (error.message?.includes('API_KEY') || error.status === 401) {
      console.warn('Invalid Gemini API key, falling back to mock grading');
      return gradeMockAnswer(req, res);
    }

    res.status(500).json({ error: 'Failed to grade answer' });
  }
};

function gradeMockAnswer(req, res) {
  const { question, answer, difficulty } = req.body;

  // Mock intelligent grading based on answer length and keywords
  let baseScore = 50;

  // Length bonus
  if (answer.length > 100) baseScore += 15;
  if (answer.length > 200) baseScore += 10;

  // Technical keywords bonus
  const techKeywords = ['react', 'node', 'javascript', 'database', 'api', 'component', 'state', 'hook'];
  const foundKeywords = techKeywords.filter(keyword =>
    answer.toLowerCase().includes(keyword)
  );
  baseScore += foundKeywords.length * 3;

  // Difficulty adjustment
  if (difficulty === 'hard') baseScore += 5;
  if (difficulty === 'easy') baseScore -= 5;

  // Add some randomness
  const finalScore = Math.min(100, Math.max(30, baseScore + Math.floor(Math.random() * 20) - 10));

  const mockFeedback = generateMockFeedback(finalScore, answer.length);

  res.json({
    success: true,
    grading: {
      score: finalScore,
      feedback: mockFeedback.feedback,
      strengths: mockFeedback.strengths,
      improvements: mockFeedback.improvements,
      gradedBy: 'mock'
    }
  });
}

function generateMockFeedback(score, answerLength) {
  let feedback, strengths, improvements;

  if (score >= 90) {
    feedback = "Excellent answer with comprehensive understanding and practical examples.";
    strengths = ["Clear explanation", "Good technical depth", "Practical examples"];
    improvements = ["Consider edge cases", "Add performance considerations"];
  } else if (score >= 75) {
    feedback = "Good answer demonstrating solid understanding with room for more detail.";
    strengths = ["Correct concepts", "Logical structure"];
    improvements = ["Provide more examples", "Explain implementation details"];
  } else if (score >= 60) {
    feedback = "Adequate answer covering basic concepts but lacking depth and specificity.";
    strengths = ["Basic understanding", "Relevant points"];
    improvements = ["Add more technical details", "Provide concrete examples"];
  } else {
    feedback = "Answer shows limited understanding and needs significant improvement.";
    strengths = ["Attempted to answer"];
    improvements = ["Study core concepts", "Practice with examples", "Provide more detailed explanations"];
  }

  return { feedback, strengths, improvements };
}

export const generateSummary = async (req, res) => {
  try {
    const { candidateProfile, answers } = req.body;

    if (!candidateProfile || !answers) {
      return res.status(400).json({ error: 'Candidate profile and answers are required' });
    }

    // If no API key configured, fall back to mock summary
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return generateMockSummary(req, res);
    }

    const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0) / answers.length;

    const prompt = `Generate a comprehensive interview summary for this candidate:

Candidate: ${candidateProfile.name}
Email: ${candidateProfile.email}
Skills: ${candidateProfile.skills?.join(', ') || 'N/A'}
Experience: ${candidateProfile.experience?.map(exp => exp.description || exp.title || exp).join('; ') || 'N/A'}

Interview Performance:
Overall Score: ${Math.round(totalScore)}/100
${answers.map((answer, index) => `
Q${index + 1} (${answer.difficulty}): ${answer.question}
Answer Score: ${answer.score}/100
`).join('')}

Please provide:
1. Overall assessment (2-3 sentences)
2. Key strengths (3-4 points)
3. Areas for improvement (2-3 points)
4. Recommendation (hire/not hire with reasoning)

Format as JSON:
{
  "overallAssessment": "string",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["improvement1", "improvement2"],
  "recommendation": "hire|conditional|not_hire",
  "recommendationReason": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800
    });

    let summary;
    try {
      summary = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      summary = generateMockSummaryData(totalScore, candidateProfile);
    }

    res.json({
      success: true,
      summary: {
        ...summary,
        overallScore: Math.round(totalScore),
        generatedBy: 'ai',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI summary generation error:', error);

    // Fallback to mock summary if AI fails
    if (error.code === 'invalid_api_key' || error.status === 401) {
      console.warn('Invalid OpenAI API key, falling back to mock summary');
      return generateMockSummary(req, res);
    }

    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

function generateMockSummary(req, res) {
  const { candidateProfile, answers } = req.body;
  const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0) / answers.length;

  const summary = generateMockSummaryData(totalScore, candidateProfile);

  res.json({
    success: true,
    summary: {
      ...summary,
      overallScore: Math.round(totalScore),
      generatedBy: 'mock',
      generatedAt: new Date().toISOString()
    }
  });
}

function generateMockSummaryData(totalScore, candidateProfile) {
  let recommendation, overallAssessment, keyStrengths, areasForImprovement, recommendationReason;

  if (totalScore >= 85) {
    recommendation = 'hire';
    overallAssessment = `${candidateProfile.name} demonstrates excellent technical competency and strong problem-solving abilities. Their responses show deep understanding of full-stack development concepts and practical experience.`;
    keyStrengths = ["Strong technical foundation", "Clear communication", "Practical experience", "Problem-solving skills"];
    areasForImprovement = ["System design at scale", "Advanced optimization techniques"];
    recommendationReason = "High technical competency and communication skills make them a strong addition to the team.";
  } else if (totalScore >= 70) {
    recommendation = 'conditional';
    overallAssessment = `${candidateProfile.name} shows good technical understanding with solid fundamentals. There are areas for growth, but they demonstrate potential for development.`;
    keyStrengths = ["Good technical basics", "Willingness to learn", "Relevant experience"];
    areasForImprovement = ["Deepen technical knowledge", "Provide more detailed explanations", "Practice complex scenarios"];
    recommendationReason = "Good foundation with potential for growth. Recommend with mentorship and focused development plan.";
  } else {
    recommendation = 'not_hire';
    overallAssessment = `${candidateProfile.name} shows basic understanding but lacks the depth required for the role. Significant gaps in technical knowledge and problem-solving approach.`;
    keyStrengths = ["Basic concepts understood", "Professional demeanor"];
    areasForImprovement = ["Strengthen core technical skills", "Gain more practical experience", "Study system design principles"];
    recommendationReason = "Technical skills do not meet current role requirements. Candidate would benefit from additional training and experience.";
  }

  return {
    overallAssessment,
    keyStrengths,
    areasForImprovement,
    recommendation,
    recommendationReason
  };
}
