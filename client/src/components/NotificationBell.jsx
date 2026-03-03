import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiUserPlus, FiFolder, FiMessageCircle } from 'react-icons/fi';
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  acceptFriendRequest,
  rejectFriendRequest,
  acceptProjectInvite,
  rejectProjectInvite
} from '../firebase';
import './NotificationBell.css';

function NotificationBell({ userId, userProfile, onProjectJoin }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    
    // Test if audio file exists
    audio.addEventListener('error', () => {
      console.warn('⚠️ notification.mp3 not found in public folder');
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log('✅ notification.mp3 loaded successfully');
    });
    
    audioRef.current = audio;
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to notifications
    const unsubscribe = subscribeToNotifications(userId, (notifs) => {
      const newUnreadCount = notifs.filter(n => !n.read).length;
      
      // Play sound if new notification arrived (increased count)
      if (newUnreadCount > unreadCount && unreadCount >= 0) {
        console.log('🔔 Playing notification sound...');
        audioRef.current?.play().catch(err => {
          console.warn('Audio play failed:', err.message);
        });
      }
      
      setNotifications(notifs);
      setUnreadCount(newUnreadCount);
    });

    return () => unsubscribe();
  }, [userId, unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(userId, notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(userId, notificationId);
  };

  const handleAcceptFriend = async (notification) => {
    try {
      await acceptFriendRequest(
        notification.data.requestId,
        notification.from,
        userId,
        userProfile.username,
        userProfile.photoURL
      );
      await handleDelete(notification.id);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectFriend = async (notification) => {
    try {
      await rejectFriendRequest(notification.data.requestId);
      await handleDelete(notification.id);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleAcceptProject = async (notification) => {
    try {
      const projectId = await acceptProjectInvite(
        notification.data.inviteId,
        notification.data.projectId,
        userId,
        userProfile.username
      );
      await handleDelete(notification.id);
      
      // Notify parent to join project
      if (onProjectJoin) {
        onProjectJoin(projectId, notification.data.projectName);
      }
    } catch (error) {
      console.error('Error accepting project invite:', error);
    }
  };

  const handleRejectProject = async (notification) => {
    try {
      await rejectProjectInvite(notification.data.inviteId);
      await handleDelete(notification.id);
    } catch (error) {
      console.error('Error rejecting project invite:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <FiUserPlus className="notif-icon friend" />;
      case 'project_invite':
        return <FiFolder className="notif-icon project" />;
      case 'message':
        return <FiMessageCircle className="notif-icon message" />;
      default:
        return <FiBell className="notif-icon" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    return `${days} ngày`;
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Thông báo"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>
              <FiBell size={18} /> Thông báo
              {unreadCount > 0 && <span className="unread-count">({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                <FiCheck size={14} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <FiBell size={48} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                >
                  <div className="notif-avatar">
                    {notif.fromAvatar ? (
                      <img src={notif.fromAvatar} alt={notif.fromName} />
                    ) : (
                      getNotificationIcon(notif.type)
                    )}
                  </div>

                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">{formatTime(notif.createdAt)}</span>

                    {/* Friend Request Actions */}
                    {notif.type === 'friend_request' && (
                      <div className="notif-actions">
                        <button 
                          className="btn-accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptFriend(notif);
                          }}
                        >
                          <FiCheck size={14} /> Chấp nhận
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectFriend(notif);
                          }}
                        >
                          <FiX size={14} /> Từ chối
                        </button>
                      </div>
                    )}

                    {/* Project Invite Actions */}
                    {notif.type === 'project_invite' && (
                      <div className="notif-actions">
                        <button 
                          className="btn-accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptProject(notif);
                          }}
                        >
                          <FiCheck size={14} /> Tham gia
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectProject(notif);
                          }}
                        >
                          <FiX size={14} /> Bỏ qua
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    className="notif-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    title="Xóa thông báo"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button onClick={() => setShowDropdown(false)}>
                Đóng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
