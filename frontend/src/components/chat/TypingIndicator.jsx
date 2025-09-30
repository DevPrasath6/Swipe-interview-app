import React from 'react';

export default function TypingIndicator({ visible = true }) {
  if (!visible) return null;

  return (
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );
}
