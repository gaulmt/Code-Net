import { useState, useEffect, useRef } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import { joinDocument, sendChatMessage } from '../socket';
import './Sidebar.css';

function Sidebar({ documentId, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!user || !documentId || hasJoinedRef.current) return;

    hasJoinedRef.current = true;
    
    joinDocument(documentId, user, {
      onChatUpdate: (msgs) => {
        setMessages(msgs);
      }
    });

    return () => {
      hasJoinedRef.current = false;
    };
  }, [documentId, user?.id]); // Only re-join if documentId or user.id changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && user) {
      sendChatMessage(documentId, user, input.trim());
      setInput('');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Chat & Thảo luận</h3>
        {onClose && (
          <button className="close-sidebar-btn" onClick={onClose} title="Ẩn chat">
            <FiX />
          </button>
        )}
      </div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-header">
              <span 
                className="user-badge" 
                style={{ backgroundColor: msg.userColor }}
              >
                {msg.userName?.[0]?.toUpperCase()}
              </span>
              <span className="username">{msg.userName}</span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>
          <FiSend />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
