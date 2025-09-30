import React from 'react';

export default function ChatWindow({ messages, isTyping }) {
  return (
    <div className="chat-messages">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.type}`}>
          {message.text}
        </div>
      ))}
      {isTyping && (
        <div className="message bot">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}
