import { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, FiSend, FiPaperclip, FiSmile,
  FiPhone, FiVideo, FiInfo, FiX, FiCheck, FiCheckCircle,
  FiImage, FiCode, FiUsers
} from 'react-icons/fi';
import { 
  getConversations,
  getMessages,
  sendMessage,
  searchUsers,
  createConversation,
  markAsRead,
  getOnlineUsers
} from '../firebase';
import './Messenger.css';

function Messenger({ onClose, authUser, userProfile }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (authUser && userProfile) {
      loadConversations();
      loadOnlineUsers();
      
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => {
        if (activeConversation) {
          loadMessages(activeConversation.id);
        }
        loadConversations();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [authUser, userProfile, activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const convos = await getConversations(authUser.uid);
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
      
      // Mark as read
      await markAsRead(conversationId, authUser.uid);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const online = await getOnlineUsers();
      setOnlineUsers(online);
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
    setShowSearch(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    try {
      await sendMessage(
        activeConversation.id,
        authUser.uid,
        userProfile.username,
        userProfile.photoURL,
        messageInput.trim()
      );
      
      setMessageInput('');
      await loadMessages(activeConversation.id);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(searchQuery);
      // Filter out current user
      setSearchResults(results.filter(u => u.id !== authUser.uid));
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleStartConversation = async (user) => {
    try {
      const conversationId = await createConversation(
        authUser.uid,
        user.id,
        userProfile.username,
        user.username,
        userProfile.photoURL,
        user.photoURL
      );
      
      // Load the new conversation
      await loadConversations();
      
      // Find and select it
      const newConvo = {
        id: conversationId,
        otherUser: {
          id: user.id,
          username: user.username,
          photoURL: user.photoURL
        }
      };
      
      setActiveConversation(newConvo);
      await loadMessages(conversationId);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (diff < 86400000) { // Less than 24 hours
      return `${hours}:${minutes}`;
    } else if (diff < 604800000) { // Less than 7 days
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const isOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="messenger-overlay">
      <div className="messenger-container">
        {/* Sidebar */}
        <div className="messenger-sidebar">
          <div className="sidebar-header">
            <div className="header-left">
              <img src={userProfile.photoURL} alt="You" className="user-avatar-small" />
              <h2>Tin nhắn</h2>
            </div>
            <button className="close-btn-messenger" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className="search-bar-messenger">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setShowSearch(true);
                  handleSearch();
                } else {
                  setShowSearch(false);
                  setSearchResults([]);
                }
              }}
            />
          </div>

          <div className="conversations-list">
            {showSearch ? (
              // Search Results
              searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div
                    key={user.id}
                    className="conversation-item"
                    onClick={() => handleStartConversation(user)}
                  >
                    <div className="avatar-wrapper">
                      <img src={user.photoURL} alt={user.username} className="conversation-avatar" />
                      {isOnline(user.id) && <div className="online-indicator"></div>}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">{user.username}</div>
                      <div className="conversation-preview">Nhấn để bắt đầu trò chuyện</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Không tìm thấy người dùng</p>
                </div>
              )
            ) : (
              // Conversations List
              conversations.length > 0 ? (
                conversations.map(convo => (
                  <div
                    key={convo.id}
                    className={`conversation-item ${activeConversation?.id === convo.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(convo)}
                  >
                    <div className="avatar-wrapper">
                      <img src={convo.otherUser.photoURL} alt={convo.otherUser.username} className="conversation-avatar" />
                      {isOnline(convo.otherUser.id) && <div className="online-indicator"></div>}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">{convo.otherUser.username}</div>
                      <div className="conversation-preview">
                        {convo.lastMessage?.senderId === authUser.uid && 'Bạn: '}
                        {convo.lastMessage?.text || 'Bắt đầu trò chuyện'}
                      </div>
                    </div>
                    <div className="conversation-meta">
                      <div className="conversation-time">
                        {convo.lastMessage?.timestamp && formatTime(convo.lastMessage.timestamp)}
                      </div>
                      {convo.unreadCount > 0 && (
                        <div className="unread-badge">{convo.unreadCount}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FiUsers size={48} />
                  <p>Chưa có cuộc trò chuyện nào</p>
                  <p className="hint">Tìm kiếm người dùng để bắt đầu</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="messenger-chat">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="avatar-wrapper">
                    <img 
                      src={activeConversation.otherUser.photoURL} 
                      alt={activeConversation.otherUser.username} 
                      className="chat-avatar" 
                    />
                    {isOnline(activeConversation.otherUser.id) && <div className="online-indicator"></div>}
                  </div>
                  <div className="chat-user-info">
                    <div className="chat-username">{activeConversation.otherUser.username}</div>
                    <div className="chat-status">
                      {isOnline(activeConversation.otherUser.id) ? 'Đang hoạt động' : 'Không hoạt động'}
                    </div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="header-action-btn" title="Gọi thoại">
                    <FiPhone />
                  </button>
                  <button className="header-action-btn" title="Gọi video">
                    <FiVideo />
                  </button>
                  <button className="header-action-btn" title="Thông tin">
                    <FiInfo />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isOwn = msg.senderId === authUser.uid;
                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                    const showTime = idx === messages.length - 1 || 
                                    messages[idx + 1].senderId !== msg.senderId ||
                                    messages[idx + 1].timestamp - msg.timestamp > 300000; // 5 minutes

                    return (
                      <div key={msg.id} className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
                        {!isOwn && showAvatar && (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="message-avatar" />
                        )}
                        {!isOwn && !showAvatar && <div className="message-avatar-spacer"></div>}
                        
                        <div className="message-content-wrapper">
                          <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                            {msg.text}
                          </div>
                          {showTime && (
                            <div className={`message-time ${isOwn ? 'own' : 'other'}`}>
                              {formatTime(msg.timestamp)}
                              {isOwn && msg.read && <FiCheckCircle className="read-icon" />}
                              {isOwn && !msg.read && <FiCheck className="sent-icon" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-messages">
                    <FiUsers size={64} />
                    <p>Chưa có tin nhắn nào</p>
                    <p className="hint">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="message-input-container">
                <button className="input-action-btn" title="Đính kèm">
                  <FiPaperclip />
                </button>
                <button className="input-action-btn" title="Hình ảnh">
                  <FiImage />
                </button>
                <button className="input-action-btn" title="Code">
                  <FiCode />
                </button>
                
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Aa"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <button className="input-action-btn" title="Emoji">
                  <FiSmile />
                </button>
                
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <FiSend />
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <FiUsers size={80} />
              <h3>Messenger của bạn</h3>
              <p>Chọn một cuộc trò chuyện hoặc tìm kiếm người dùng để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messenger;
