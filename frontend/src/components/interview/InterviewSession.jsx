import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSession, updateSession, addAnswer, addCandidate, setCurrentSession, clearCurrentSession } from '../../store/index';
import { generateQuestions, gradeAnswer, calculateFinalScore, generateSummary } from '../../services/aiService';
import { getUnfinishedSession } from '../../services/persistence';
import ResumeUploader from '../resumeUploader/ResumeUploader';
import ChatWindow from '../chat/ChatWindow';
import TypingIndicator from '../chat/TypingIndicator';

export default function InterviewSession() {
  const dispatch = useDispatch();
  const currentSession = useSelector(state => state.currentSession);
  const sessions = useSelector(state => state.sessions);

  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState('welcome'); // welcome, resume-upload, missing-fields, interview, completed
  const [candidate, setCandidate] = useState({ name: '', email: '', phone: '' });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [currentMissingFieldIndex, setCurrentMissingFieldIndex] = useState(0);

  const timerRef = useRef();
  const chatEndRef = useRef();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize session
  useEffect(() => {
    // Check for existing unfinished session
    const unfinishedSession = getUnfinishedSession();
    if (unfinishedSession) {
      dispatch(setCurrentSession(unfinishedSession.id));
      resumeSession(unfinishedSession);
    } else {
      startWelcome();
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(t => {
          if (t <= 1) {
            handleTimeUp();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerActive]);

  const addMessage = useCallback((text, type = 'bot', delay = 0) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { text, type, timestamp: new Date() }]);
      setIsTyping(false);
    }, delay);
  }, []);

  const showTyping = useCallback((duration = 1500) => {
    setIsTyping(true);
    return new Promise(resolve => setTimeout(resolve, duration));
  }, []);

  const startWelcome = () => {
    setStage('welcome');
    addMessage("👋 Welcome to the Full-Stack Developer Interview!");
    setTimeout(() => {
      addMessage("I'm your AI interviewer. Let's start by uploading your resume so I can get to know you better.");
    }, 2000);
    setTimeout(() => {
      setStage('resume-upload');
    }, 3500);
  };

  const resumeSession = (session) => {
    setMessages(prev => [...prev, { text: "🔄 Resuming your interview session...", type: 'system' }]);

    // Restore session state
    setCandidate({
      name: session.candidate?.name || '',
      email: session.candidate?.email || '',
      phone: session.candidate?.phone || ''
    });

    if (session.stage === 'missing-fields') {
      setStage('missing-fields');
      setMissingFields(session.missingFields || []);
      setCurrentMissingFieldIndex(session.currentMissingFieldIndex || 0);
      resumeMissingFieldsCollection();
    } else if (session.stage === 'interview') {
      setStage('interview');
      setQuestions(session.questions || []);
      setCurrentQuestionIndex(session.currentQuestionIndex || 0);
      resumeInterview();
    }
  };

  const handleResumeUpload = async (resumeData) => {
    await showTyping();
    addMessage(`✅ Great! I can see your resume. Let me extract your information...`);

    await showTyping(2000);

    const extractedData = {
      name: resumeData.name || '',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      // Include all resume data for AI analysis
      skills: resumeData.skills || [],
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      summary: resumeData.summary || '',
      rawText: resumeData.text || ''
    };

    setCandidate(extractedData);

    // Check for missing fields
    const missing = [];
    if (!extractedData.name) missing.push('name');
    if (!extractedData.email) missing.push('email');
    if (!extractedData.phone) missing.push('phone');

    if (missing.length > 0) {
      setMissingFields(missing);
      setCurrentMissingFieldIndex(0);
      addMessage(`I found some information, but I need a few more details before we begin.`);
      setTimeout(() => {
        setStage('missing-fields');
        startMissingFieldsCollection();
      }, 1500);
    } else {
      addMessage(`Perfect! I have all your information:
📧 Email: ${extractedData.email}
📱 Phone: ${extractedData.phone}`);
      setTimeout(() => {
        startInterview();
      }, 2000);
    }
  };

  const startMissingFieldsCollection = () => {
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      candidate,
      stage: 'missing-fields',
      missingFields,
      currentMissingFieldIndex: 0,
      inProgress: true,
      startedAt: new Date().toISOString()
    };

    dispatch(addSession(session));
    dispatch(setCurrentSession(sessionId));

    askForMissingField();
  };

  const resumeMissingFieldsCollection = () => {
    addMessage("Let's continue collecting your information...");
    setTimeout(askForMissingField, 1000);
  };

  const askForMissingField = async () => {
    if (currentMissingFieldIndex >= missingFields.length) {
      startInterview();
      return;
    }

    const field = missingFields[currentMissingFieldIndex];
    await showTyping();

    const prompts = {
      name: "What's your full name?",
      email: "What's your email address?",
      phone: "What's your phone number?"
    };

    addMessage(prompts[field]);
  };

  const handleMissingFieldResponse = (response) => {
    const field = missingFields[currentMissingFieldIndex];
    const updatedCandidate = { ...candidate, [field]: response };
    setCandidate(updatedCandidate);

    addMessage(response, 'user');

    setTimeout(async () => {
      await showTyping();
      addMessage(`✅ Thanks! Got your ${field}.`);

      const nextIndex = currentMissingFieldIndex + 1;
      setCurrentMissingFieldIndex(nextIndex);

      // Update session
      if (currentSession) {
        dispatch(updateSession({
          id: currentSession,
          candidate: updatedCandidate,
          currentMissingFieldIndex: nextIndex
        }));
      }

      if (nextIndex >= missingFields.length) {
        setTimeout(() => {
          addMessage("Perfect! Now I have all your information. Let's begin the technical interview!");
          setTimeout(startInterview, 2000);
        }, 1000);
      } else {
        setTimeout(askForMissingField, 1000);
      }
    }, 500);
  };

  const startInterview = async () => {
    const sessionId = currentSession || Date.now().toString();

    // Generate AI-powered questions based on candidate profile
    const interviewQuestions = await generateQuestions(candidate, sessionId);
    setQuestions(interviewQuestions);
    setCurrentQuestionIndex(0);
    setStage('interview');

    const session = {
      id: sessionId,
      candidate,
      stage: 'interview',
      questions: interviewQuestions,
      currentQuestionIndex: 0,
      answers: [],
      inProgress: true,
      startedAt: new Date().toISOString()
    };

    if (currentSession) {
      dispatch(updateSession(session));
    } else {
      dispatch(addSession(session));
      dispatch(setCurrentSession(sessionId));
    }

    setTimeout(async () => {
      await showTyping();
      addMessage(`🚀 Let's start with the technical questions! You'll have 6 questions total:
• 2 Easy questions (20 seconds each)
• 2 Medium questions (60 seconds each)
• 2 Hard questions (120 seconds each)

Ready? Here's your first question:`);
      setTimeout(askQuestion, 2000);
    }, 1000);
  };

  const resumeInterview = () => {
    addMessage("Continuing with your interview...");
    setTimeout(askQuestion, 1500);
  };

  const askQuestion = async () => {
    if (currentQuestionIndex >= questions.length) {
      completeInterview();
      return;
    }

    const question = questions[currentQuestionIndex];
    await showTyping();

    addMessage(`❓ **Question ${currentQuestionIndex + 1}/6 (${question.level.toUpperCase()})**

${question.text}

⏰ You have ${question.timeLimit} seconds to answer.`);

    // Start timer
    setTimer(question.timeLimit);
    setTimerActive(true);

    // Update session
    if (currentSession) {
      dispatch(updateSession({
        id: currentSession,
        currentQuestionIndex,
        timerStartedAt: new Date().toISOString(),
        timerDuration: question.timeLimit
      }));
    }
  };

  const handleTimeUp = () => {
    setTimerActive(false);

    if (currentInput.trim()) {
      submitAnswer(currentInput, true);
    } else {
      addMessage("⏰ Time's up!", 'system');
      submitAnswer('', true);
    }
  };

  const submitAnswer = async (answer, timeUp = false) => {
    setTimerActive(false);
    setCurrentInput('');

    const question = questions[currentQuestionIndex];
    const timeSpent = question.timeLimit - timer;

    // Add user's answer to chat
    if (answer.trim()) {
      addMessage(answer, 'user');
    } else {
      addMessage("(No answer provided)", 'user');
    }

    // Grade the answer
    const grading = gradeAnswer(answer, question);

    // Add answer to session
    const answerData = {
      questionIndex: currentQuestionIndex,
      question: question.text,
      answer: answer.trim(),
      timeSpent,
      timeUp,
      ...grading
    };

    if (currentSession) {
      dispatch(addAnswer({ sessionId: currentSession, ...answerData }));
    }

    // Show feedback
    await showTyping();
    addMessage(`📊 **Feedback:** ${grading.feedback} (Score: ${grading.score}/100)`);

    // Move to next question or complete
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    if (nextIndex >= questions.length) {
      setTimeout(completeInterview, 2000);
    } else {
      setTimeout(async () => {
        await showTyping();
        addMessage(`Next question coming up...`);
        setTimeout(askQuestion, 1500);
      }, 2000);
    }
  };

  const completeInterview = async () => {
    setStage('completed');
    setTimerActive(false);

    // Get all answers from the session
    const session = sessions.find(s => s.id === currentSession);
    const answers = session?.answers || [];

    // Calculate final score and generate summary
    const finalScore = calculateFinalScore(answers);
    const summary = generateSummary(candidate, answers);

    await showTyping();
    addMessage(`🎉 **Interview Complete!**

Your final score: **${finalScore}/100**

${summary}`);

    // Create candidate record
    const candidateRecord = {
      id: Date.now().toString(),
      ...candidate,
      score: finalScore,
      summary,
      answers,
      completedAt: new Date().toISOString(),
      status: 'completed'
    };

    dispatch(addCandidate(candidateRecord));

    // Mark session as completed
    if (currentSession) {
      dispatch(updateSession({
        id: currentSession,
        inProgress: false,
        completedAt: new Date().toISOString(),
        stage: 'completed',
        finalScore
      }));
    }

    setTimeout(() => {
      addMessage("Thank you for taking the time to complete this interview! You can now switch to the Interviewer Dashboard to see your results.");
      dispatch(clearCurrentSession());
    }, 3000);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();

    if (!currentInput.trim()) return;

    if (stage === 'missing-fields') {
      handleMissingFieldResponse(currentInput);
      setCurrentInput('');
    } else if (stage === 'interview') {
      submitAnswer(currentInput);
    }
  };

  const getTimerClass = () => {
    if (timer <= 5) return 'danger';
    if (timer <= 10) return 'warning';
    return '';
  };

  const canSubmit = currentInput.trim() && (stage === 'missing-fields' || stage === 'interview');

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>AI Interview Assistant</h3>
        {stage === 'interview' && (
          <div className="progress-bar">
            <div className="progress-steps">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`progress-step ${
                    index < currentQuestionIndex ? 'completed' :
                    index === currentQuestionIndex ? 'current' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {stage === 'resume-upload' && (
          <div style={{ padding: '20px' }}>
            <ResumeUploader onComplete={handleResumeUpload} />
          </div>
        )}

        <ChatWindow messages={messages} isTyping={isTyping} />
        <div ref={chatEndRef} />
      </div>

      {(stage === 'missing-fields' || stage === 'interview') && (
        <form onSubmit={handleInputSubmit} className="chat-input-area">
          <div className="input-with-timer">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={
                stage === 'missing-fields'
                  ? "Type your response..."
                  : "Type your answer here... (or press Submit when ready)"
              }
              className="chat-input"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleInputSubmit(e);
                }
              }}
            />

            {stage === 'interview' && timerActive && (
              <div className={`timer-display ${getTimerClass()}`}>
                <div className="timer-seconds">{timer}</div>
                <div className="timer-label">SEC</div>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={!canSubmit}
            >
              Submit
            </button>
          </div>

          {stage === 'interview' && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Press Ctrl+Enter to submit quickly, or click Submit button
            </div>
          )}
        </form>
      )}
    </div>
  );
}
