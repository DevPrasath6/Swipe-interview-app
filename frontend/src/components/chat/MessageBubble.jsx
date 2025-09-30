import React, { useState, useEffect } from 'react';

export default function MessageBubble({ message, onEdit, editable = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleSave = () => {
    if (onEdit && editText.trim()) {
      onEdit(editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  return (
    <div className={`message ${message.type}`}>
      {isEditing ? (
        <div className="message-edit">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="btn btn-primary">Save</button>
            <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="message-content">{message.text}</div>
          {editable && message.type === 'user' && (
            <button
              onClick={() => setIsEditing(true)}
              className="edit-btn"
              title="Edit message"
            >
              ✏️
            </button>
          )}
        </>
      )}
    </div>
  );
}
