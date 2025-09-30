import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntervieweePage from './IntervieweePage';
import InterviewerPage from './InterviewerPage';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/interviewee" element={<IntervieweePage />} />
        <Route path="/interviewer" element={<InterviewerPage />} />
        <Route path="/" element={<Navigate to="/interviewee" replace />} />
      </Routes>
    </Router>
  );
}
