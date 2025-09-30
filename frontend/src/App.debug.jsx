import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store/index';
import './index.css';

// Simple error boundary component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason);
    });

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>⚠️ Application Error</h1>
        <pre>{error?.toString()}</pre>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  return children;
}

// Simple app component
function SimpleApp() {
  const [activeTab, setActiveTab] = useState('interviewee');

  return (
    <div className="app">
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'interviewee' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviewee')}
        >
          Interviewee
        </button>
        <button
          className={`tab ${activeTab === 'interviewer' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviewer')}
        >
          Interviewer Dashboard
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'interviewee' && (
          <div style={{ padding: '20px' }}>
            <h2>🎯 Interviewee Section</h2>
            <p>✅ Application is loading successfully!</p>
            <p>Ready to upload resume and start interview.</p>
          </div>
        )}
        {activeTab === 'interviewer' && (
          <div style={{ padding: '20px' }}>
            <h2>📊 Interviewer Dashboard</h2>
            <p>✅ Dashboard tab is working!</p>
            <p>Ready to view candidate analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SimpleApp />
      </Provider>
    </ErrorBoundary>
  );
}
