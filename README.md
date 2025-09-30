# AI-Powered Interview Assistant

A React-based interview assistant that uses AI to conduct technical interviews with real-time scoring and candidate management.

## Features

✅ **Two-Tab Interface**: Seamlessly switch between Interviewee (chat interface) and Interviewer (dashboard)
✅ **Resume Upload & Parsing**: Support for PDF files with automatic extraction of Name, Email, Phone
✅ **Smart Missing Field Collection**: Chatbot prompts for any missing information before starting
✅ **Timed Interview System**:
  - 6 questions total (2 Easy → 2 Medium → 2 Hard)
  - Variable timers: Easy (20s), Medium (60s), Hard (120s)
  - Auto-submit when time expires
✅ **Real-time AI Scoring**: Intelligent grading with detailed feedback
✅ **Complete Persistence**: All progress saved locally with automatic restore
✅ **Welcome Back Modal**: Resume interrupted sessions seamlessly
✅ **Interviewer Dashboard**:
  - Candidate list with search and sort functionality
  - Detailed view of chat history, scores, and AI summaries
  - Performance breakdowns by question difficulty
✅ **Cross-Tab Synchronization**: Changes sync across browser tabs in real-time

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser to:**
```
http://localhost:3000
```

## Usage Guide

### For Candidates (Interviewee Tab)
1. **Upload Resume**: Click to upload a PDF resume
2. **Provide Missing Info**: Answer any questions for missing fields (name, email, phone)
3. **Complete Interview**: Answer 6 technical questions with time limits
4. **View Results**: Get instant AI feedback and final score

### For Interviewers (Interviewer Tab)
1. **View Candidate List**: See all completed interviews sorted by score
2. **Search & Filter**: Find candidates by name, email, or phone
3. **Detailed Reviews**: Click any candidate to see full interview transcript, individual question scores, and AI summary
4. **Performance Analytics**: Review breakdown by question difficulty

## Technical Implementation

### Frontend Stack
- **React 18** with Hooks and functional components
- **Redux Toolkit** for state management
- **localStorage** for data persistence
- **CSS3** with responsive design
- **Vite** for fast development and building

### Key Features
- **Client-side PDF parsing** using pdfjs-dist
- **Real-time timers** with auto-submission
- **Cross-tab sync** via BroadcastChannel API
- **Deterministic AI** with keyword-based scoring (no external API required)
- **Progressive enhancement** ready for OpenAI integration

---

**Built for the Swipe Internship Assignment** - A complete AI-powered interview assistant demonstrating modern React development, state management, and user experience design.
