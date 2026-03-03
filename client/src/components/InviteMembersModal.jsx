import { useState, useEffect } from 'react';
import { FiX, FiCopy, FiCheck, FiUserPlus, FiSearch } from 'react-icons/fi';
import { getFriends, getUserStatus, searchUserByUsername, sendFriendRequest, getUserProfile, sendProjectInvite } from '../firebase';
import './InviteMembersModal.css';

function InviteMembersModal({ roomId, userId, onClose, projectName, userProfile }) {
  const [friends, setFriends] = useState([]);
  const [friendsStatus, setFriendsStatus] = useState({});
  const [copied, setCopied] = useState(false);
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
      
      // Load online status for each friend
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
        // Check if already friends
        const isFriend = friends.some(f => f.id === result.userId);
        setSearchResult({ ...result, isFriend, isSelf: result.userId === userId });
      } else {
        setSearchResult({ notFound: true });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      alert('Lỗi khi tìm kiếm: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendUserId, friendUsername) => {
    setAddingFriend(true);
    try {
      // Get current user profile
      const userProfile = await getUserProfile(userId);
      
      // Send friend request instead of adding directly
      await sendFriendRequest(userId, friendUserId, userProfile.username, userProfile.photoURL);
      alert(`Đã gửi lời mời kết bạn đến ${friendUsername}!`);
      setSearchResult(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Lỗi khi gửi lời mời kết bạn: ' + error.message);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = async (friendId, friendUsername) => {
    try {
      // Send project invite notification
      await sendProjectInvite(
        roomId,
        projectName || roomId,
        userId,
        userProfile?.username || 'Someone',
        friendId
      );
      
      alert(`Đã gửi lời mời vào project "${projectName || roomId}" cho ${friendUsername}!`);
    } catch (error) {
      console.error('Error sending project invite:', error);
      alert('Lỗi khi gửi lời mời: ' + error.message);
    }
  };

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-header">
          <h3>Mời thành viên</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="invite-modal-content">
          {/* Room Code Section */}
          <div className="room-code-section">
            <label>Mã phòng</label>
            <div className="room-code-box">
              <code className="room-code">{roomId}</code>
              <button 
                className={`copy-code-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyCode}
              >
                {copied ? <><FiCheck /> Đã copy</> : <><FiCopy /> Copy</>}
              </button>
            </div>
            <p className="room-code-hint">
              Chia sẻ mã này để mời người khác tham gia
            </p>
          </div>

          {/* Search User Section */}
          <div className="search-user-section">
            <label>Tìm kiếm người dùng</label>
            <div className="search-box">
              <input
                type="text"
                placeholder="Nhập tên người dùng..."
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
                      <div>
                        <div className="result-username">
                          {searchResult.username}
                          {searchResult.username === 'gaulmt' && (
                            <svg className="verified-badge" viewBox="0 0 24 24" width="16" height="16">
                              <path fill="#1DA1F2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              <path fill="#fff" d="M9 12l2 2 4-4" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
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

          {/* Friends List Section */}
          <div className="friends-section">
            <h4>Bạn bè ({friends.length})</h4>
            
            {loading ? (
              <div className="loading-friends">
                <div className="spinner-small"></div>
                <p>Đang tải danh sách bạn bè...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="no-friends">
                <p>Bạn chưa có bạn bè nào</p>
                <p className="hint">Thêm bạn bè để mời họ vào phòng</p>
              </div>
            ) : (
              <div className="friends-list">
                {friends.map((friend) => {
                  const status = friendsStatus[friend.id];
                  const isOnline = status?.online;
                  const isAdmin = friend.username === 'gaulmt';
                  
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
                          <div className="friend-name">
                            {friend.username}
                            {isAdmin && (
                              <svg className="verified-badge" viewBox="0 0 24 24" width="16" height="16">
                                <path fill="#1DA1F2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                <path fill="#fff" d="M9 12l2 2 4-4" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="friend-status">
                            {isOnline ? 'Đang online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="invite-btn"
                        onClick={() => handleInviteFriend(friend.id, friend.username)}
                      >
                        <FiUserPlus /> Mời
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

export default InviteMembersModal;
