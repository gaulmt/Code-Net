import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiUserPlus, FiMessageCircle, FiX, FiUserMinus } from 'react-icons/fi';
import { 
  getFriends, 
  removeFriend, 
  searchUserByUsername,
  sendFriendRequest,
  getUserProfile
} from '../firebase';
import './FriendsList.css';

function FriendsList({ userId, userProfile, onClose, onSendMessage }) {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // friends, search

  useEffect(() => {
    if (userId) {
      loadFriends();
    }
  }, [userId]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const friendsData = await getFriends(userId);
      const friendsList = [];
      
      for (const [friendId, friendData] of Object.entries(friendsData)) {
        const profile = await getUserProfile(friendId);
        friendsList.push({
          id: friendId,
          ...friendData,
          ...profile
        });
      }
      
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchUserByUsername(searchQuery.trim());
      if (result && result.userId !== userId) {
        // Check if already friends
        const isFriend = friends.some(f => f.id === result.userId);
        setSearchResults([{ ...result, isFriend }]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (toUserId, toUsername) => {
    try {
      await sendFriendRequest(
        userId,
        toUserId,
        userProfile.username,
        userProfile.photoURL
      );
      alert(`Đã gửi lời mời kết bạn đến ${toUsername}!`);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Lỗi khi gửi lời mời kết bạn!');
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${friendName} khỏi danh sách bạn bè?`)) {
      try {
        await removeFriend(userId, friendId);
        await loadFriends();
      } catch (error) {
        console.error('Error removing friend:', error);
        alert('Lỗi khi xóa bạn bè!');
      }
    }
  };

  return (
    <div className="friends-list-overlay">
      <div className="friends-list-container">
        {/* Header */}
        <div className="friends-list-header">
          <h2>
            <FiUsers size={24} /> Bạn Bè
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="friends-tabs">
          <button 
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <FiUsers size={18} /> Danh sách ({friends.length})
          </button>
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <FiUserPlus size={18} /> Thêm bạn
          </button>
        </div>

        {/* Content */}
        <div className="friends-list-content">
          {activeTab === 'friends' ? (
            // Friends List
            <div className="friends-section">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Đang tải...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="empty-state">
                  <FiUsers size={64} />
                  <p>Chưa có bạn bè nào</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('search')}
                  >
                    <FiUserPlus /> Thêm bạn bè
                  </button>
                </div>
              ) : (
                <div className="friends-grid">
                  {friends.map(friend => (
                    <div key={friend.id} className="friend-card">
                      <img 
                        src={friend.photoURL} 
                        alt={friend.username}
                        className="friend-avatar"
                      />
                      <div className="friend-info">
                        <h4>{friend.username}</h4>
                        <p className="friend-status">
                          {friend.status === 'accepted' ? '✓ Bạn bè' : 'Đang chờ'}
                        </p>
                      </div>
                      <div className="friend-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => onSendMessage && onSendMessage(friend.id)}
                          title="Nhắn tin"
                        >
                          <FiMessageCircle size={18} />
                        </button>
                        <button 
                          className="btn-icon btn-danger"
                          onClick={() => handleRemoveFriend(friend.id, friend.username)}
                          title="Xóa bạn"
                        >
                          <FiUserMinus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Search Section
            <div className="search-section">
              <div className="search-bar">
                <FiSearch size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className="btn-search"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? 'Đang tìm...' : 'Tìm'}
                </button>
              </div>

              <div className="search-results">
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="empty-state">
                    <FiSearch size={48} />
                    <p>Không tìm thấy người dùng "{searchQuery}"</p>
                  </div>
                )}

                {searchResults.map(user => (
                  <div key={user.userId} className="user-result-card">
                    <img 
                      src={user.photoURL} 
                      alt={user.username}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <h4>{user.username}</h4>
                      {user.isFriend && (
                        <p className="already-friend">✓ Đã là bạn bè</p>
                      )}
                    </div>
                    {!user.isFriend && (
                      <button 
                        className="btn-add-friend"
                        onClick={() => handleSendFriendRequest(user.userId, user.username)}
                      >
                        <FiUserPlus size={18} /> Kết bạn
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="search-hint">
                <p>💡 Mẹo: Nhập chính xác tên người dùng để tìm kiếm</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendsList;
