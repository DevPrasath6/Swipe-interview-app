// Voice input component for answering interview questions
import React, { useState, useRef, useEffect } from 'react';

export default function VoiceAnswer({ onAnswer, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        // Auto-stop after pause
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (isRecording) {
            stopRecording();
          }
        }, 3000); // Stop after 3 seconds of silence
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current || disabled) return;

    setTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    setIsRecording(false);
    recognitionRef.current.stop();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const submitVoiceAnswer = () => {
    if (!transcript.trim()) {
      setError('No speech detected. Please try again.');
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      onAnswer(transcript.trim());
      setTranscript('');
      setIsProcessing(false);
    }, 500);
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className="voice-answer voice-answer--unsupported">
        <div className="voice-answer__error">
          <p>🎤 Voice input is not supported in this browser.</p>
          <p>Try using Chrome, Firefox, or Safari for voice functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-answer ${disabled ? 'voice-answer--disabled' : ''}`}>
      <div className="voice-answer__header">
        <h3>🎤 Voice Answer</h3>
        <span className="voice-answer__status">
          {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Ready'}
        </span>
      </div>

      {error && (
        <div className="voice-answer__error">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="voice-answer__controls">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || isProcessing}
            className="voice-answer__button voice-answer__button--start"
          >
            {isProcessing ? 'Processing...' : '🎤 Start Recording'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="voice-answer__button voice-answer__button--stop"
          >
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {transcript && (
        <div className="voice-answer__transcript">
          <div className="voice-answer__transcript-header">
            <span>Transcript:</span>
            <button
              onClick={clearTranscript}
              className="voice-answer__clear"
              disabled={isRecording || isProcessing}
            >
              Clear
            </button>
          </div>

          <div className="voice-answer__transcript-content">
            {transcript}
          </div>

          <div className="voice-answer__transcript-actions">
            <button
              onClick={submitVoiceAnswer}
              disabled={!transcript.trim() || isRecording || isProcessing}
              className="voice-answer__submit"
            >
              Submit Voice Answer
            </button>
          </div>
        </div>
      )}

      <div className="voice-answer__tips">
        <h4>Voice Input Tips:</h4>
        <ul>
          <li>Speak clearly and at a normal pace</li>
          <li>Minimize background noise</li>
          <li>Recording stops automatically after 3 seconds of silence</li>
          <li>Review your transcript before submitting</li>
        </ul>
      </div>

      <style jsx>{`
        .voice-answer {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          background: #f9f9f9;
        }

        .voice-answer--disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        .voice-answer--unsupported {
          border-color: #ff9800;
          background: #fff3e0;
        }

        .voice-answer__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .voice-answer__header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .voice-answer__status {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .voice-answer__error {
          background: #ffebee;
          border: 1px solid #ef5350;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .voice-answer__error p {
          margin: 0;
          color: #c62828;
          font-size: 14px;
        }

        .voice-answer__controls {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .voice-answer__button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .voice-answer__button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .voice-answer__button--start {
          background: #4CAF50;
          color: white;
        }

        .voice-answer__button--start:hover:not(:disabled) {
          background: #45a049;
        }

        .voice-answer__button--stop {
          background: #f44336;
          color: white;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        .voice-answer__transcript {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .voice-answer__transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 500;
          color: #333;
        }

        .voice-answer__clear {
          background: #ff9800;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
        }

        .voice-answer__clear:hover:not(:disabled) {
          background: #f57c00;
        }

        .voice-answer__transcript-content {
          background: #f5f5f5;
          border-radius: 6px;
          padding: 12px;
          min-height: 60px;
          font-size: 15px;
          line-height: 1.4;
          color: #333;
          margin-bottom: 12px;
        }

        .voice-answer__transcript-actions {
          display: flex;
          justify-content: center;
        }

        .voice-answer__submit {
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 14px;
          cursor: pointer;
        }

        .voice-answer__submit:hover:not(:disabled) {
          background: #1976D2;
        }

        .voice-answer__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .voice-answer__tips {
          background: #e3f2fd;
          border-radius: 8px;
          padding: 12px;
          margin-top: 16px;
        }

        .voice-answer__tips h4 {
          margin: 0 0 8px 0;
          color: #1976d2;
          font-size: 14px;
        }

        .voice-answer__tips ul {
          margin: 0;
          padding-left: 16px;
        }

        .voice-answer__tips li {
          font-size: 13px;
          color: #555;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
