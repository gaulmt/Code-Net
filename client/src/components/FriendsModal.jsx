import { useState, useEffect } from 'react';
import { FiX, FiUserPlus, FiSearch, FiUserMinus } from 'react-icons/fi';
import { getFriends, getUserStatus, searchUserByUsername, addFriend, removeFriend } from '../firebase';
import './FriendsModal.css';

function FriendsModal({ userId, onClose }) {
  const [friends, setFriends] = useState([]);
  const [friendsStatus, setFriendsStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    if (!userId) return;
    
    try {
      const friendsData = await getFriends(userId);
      const friendsList = Object.entries(friendsData).map(([friendId, data]) => ({
        id: friendId,
        ...data
      }));
      
      setFriends(friendsList);
      
      // Load online status
      const statusPromises = friendsList.map(friend => 
        getUserStatus(friend.id).then(status => ({ id: friend.id, status }))
      );
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      statuses.forEach(({ id, status }) => {
        statusMap[id] = status;
      });
      
      setFriendsStatus(statusMap);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchResult(null);
    
    try {
      const result = await searchUserByUsername(searchQuery.trim());
      if (result) {
        const isFriend = friends.some(f => f.id === result.userId);
        setSearchResult({ ...result, isFriend, isSelf: result.userId === userId });
      } else {
        setSearchResult({ notFound: true });
      }
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendUserId, friendUsername) => {
    setAddingFriend(true);
    try {
      await addFriend(userId, friendUserId, friendUsername);
      alert(`Đã kết bạn với ${friendUsername}!`);
      setSearchResult(null);
      setSearchQuery('');
      await loadFriends();
    } catch (error) {
      alert('Lỗi khi kết bạn: ' + error.message);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${friendName} khỏi danh sách bạn bè?`)) {
      try {
        await removeFriend(userId, friendId);
        await loadFriends();
      } catch (error) {
        alert('Lỗi khi xóa bạn: ' + error.message);
      }
    }
  };

  return (
    <div className="friends-modal-overlay" onClick={onClose}>
      <div className="friends-modal" onClick={(e) => e.stopPropagation()}>
        <div className="friends-modal-header">
          <h3>Bạn bè</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="friends-modal-content">
          {/* Search Section */}
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="search-btn"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
              >
                <FiSearch /> {searching ? 'Đang tìm...' : 'Tìm'}
              </button>
            </div>
            
            {searchResult && (
              <div className="search-result">
                {searchResult.notFound ? (
                  <p className="not-found">Không tìm thấy người dùng</p>
                ) : searchResult.isSelf ? (
                  <p className="not-found">Đây là tài khoản của bạn</p>
                ) : (
                  <div className="user-result">
                    <div className="user-result-info">
                      <img 
                        src={searchResult.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(searchResult.username)}&background=random`}
                        alt={searchResult.username}
                      />
                      <span className="result-username">{searchResult.username}</span>
                    </div>
                    {searchResult.isFriend ? (
                      <span className="already-friend">✓ Đã là bạn bè</span>
                    ) : (
                      <button 
                        className="add-friend-btn"
                        onClick={() => handleAddFriend(searchResult.userId, searchResult.username)}
                        disabled={addingFriend}
                      >
                        <FiUserPlus /> {addingFriend ? 'Đang thêm...' : 'Kết bạn'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Friends List */}
          <div className="friends-list-section">
            <h4>Danh sách bạn bè ({friends.length})</h4>
            
            {loading ? (
              <div className="loading-friends">
                <div className="spinner-small"></div>
                <p>Đang tải...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="no-friends">
                <p>Bạn chưa có bạn bè nào</p>
              </div>
            ) : (
              <div className="friends-list">
                {friends.map((friend) => {
                  const status = friendsStatus[friend.id];
                  const isOnline = status?.online;
                  
                  return (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-info">
                        <div className="friend-avatar">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=random`}
                            alt={friend.username}
                          />
                          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        </div>
                        <div className="friend-details">
                          <div className="friend-name">{friend.username}</div>
                          <span className="friend-status">
                            {isOnline ? 'Đang online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="remove-friend-btn"
                        onClick={() => handleRemoveFriend(friend.id, friend.username)}
                        title="Xóa bạn"
                      >
                        <FiUserMinus />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendsModal;
