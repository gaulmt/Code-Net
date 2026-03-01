import { useState } from 'react';
import { FiEdit2, FiCheck, FiX, FiMoreVertical } from 'react-icons/fi';
import { updateUserRole, updateUserPermissions, transferLeadership } from '../socket';
import './UserPanel.css';

const ROLES = {
  leader: { label: 'Leader', color: '#FFD700', icon: '👑' },
  designer: { label: 'Designer', color: '#FF6B6B', icon: '🎨' },
  developer: { label: 'Developer', color: '#4ECDC4', icon: '💻' },
  member: { label: 'Member', color: '#95E1D3', icon: '👤' },
  viewer: { label: 'Viewer', color: '#888', icon: '👁️' }
};

function UserPanel({ users, currentUser, roomId, userProfile }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPermissionMenu, setShowPermissionMenu] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [customPermissions, setCustomPermissions] = useState({ read: true, write: true });

  const isLeader = currentUser?.role === 'leader';

  const handleRoleChange = (userId, newRole) => {
    if (isLeader && userId !== currentUser.id) {
      // Set default permissions based on role
      const defaultPermissions = {
        designer: ['read', 'write'],
        developer: ['read', 'write'],
        member: ['read', 'write'],
        viewer: ['read']
      };
      
      updateUserRole(roomId, userId, newRole, defaultPermissions[newRole] || ['read']);
      setEditingUserId(null);
      setShowPermissionMenu(null);
    }
  };

  const handleCustomPermissions = (userId) => {
    if (isLeader && userId !== currentUser.id) {
      const permissions = [];
      if (customPermissions.read) permissions.push('read');
      if (customPermissions.write) permissions.push('write');
      
      updateUserPermissions(roomId, userId, permissions);
      setShowPermissionMenu(null);
    }
  };

  const handleTransferLeadership = (userId) => {
    if (isLeader && userId !== currentUser.id) {
      if (window.confirm(`Bạn có chắc muốn chuyển quyền Leader cho ${users.find(u => u.id === userId)?.name}? Bạn sẽ trở thành Member.`)) {
        transferLeadership(roomId, currentUser.id, userId);
        setShowPermissionMenu(null);
      }
    }
  };

  const getRoleIcon = (role) => {
    return ROLES[role]?.icon || '👤';
  };

  const getRoleColor = (role) => {
    return ROLES[role]?.color || '#888';
  };

  const hasPermission = (user, permission) => {
    return user?.permissions?.includes(permission);
  };

  const togglePermissionMenu = (userId) => {
    if (showPermissionMenu === userId) {
      setShowPermissionMenu(null);
    } else {
      const user = users.find(u => u.id === userId);
      setCustomPermissions({
        read: hasPermission(user, 'read'),
        write: hasPermission(user, 'write')
      });
      setShowPermissionMenu(userId);
    }
  };

  const handleGoHome = () => {
    if (window.confirm('Bạn có muốn rời khỏi phòng và quay về trang chủ?')) {
      window.location.reload();
    }
  };

  return (
    <div className="user-panel">
      <div className="logo">
        <div className="logo-nav-panel" onClick={handleGoHome}>
          <img src="/logo.jpg" alt="Code Net Logo" className="logo-image-panel" />
          <span className="logo-text-panel">
            <span className="logo-code">Code</span>
            <span className="logo-net">Net</span>
          </span>
        </div>
        <div className="room-info">
          <span className="room-label">Room:</span>
          <span className="room-id">{roomId}</span>
        </div>
      </div>
      
      <div className="users-list">
        <div className="users-header">
          <h4>Team ({users.length})</h4>
          {isLeader && <span className="leader-badge">👑 Bạn là Leader</span>}
        </div>

        {users.map((u) => (
          <div key={u.id} className={`user-item ${u.id === currentUser?.id ? 'current-user' : ''}`}>
            <div className="user-main">
              {/* Use profile avatar if available, otherwise use color avatar */}
              {u.id === currentUser?.id && userProfile ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={u.name}
                  className="user-avatar-img"
                />
              ) : (
                <div 
                  className="user-avatar" 
                  style={{ backgroundColor: u.color }}
                >
                  {u.name[0].toUpperCase()}
                </div>
              )}
              
              <div className="user-info">
                <div className="user-name-row">
                  <span className="user-name">
                    {u.name}
                    {u.id === currentUser?.id && ' (Bạn)'}
                    {(u.isAdmin || u.name === 'gaulmt') && (
                      <svg className="verified-badge-user" viewBox="0 0 24 24" aria-label="Admin">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="currentColor"/>
                      </svg>
                    )}
                  </span>
                  <span className="role-icon" title={ROLES[u.role]?.label}>
                    {getRoleIcon(u.role)}
                  </span>
                </div>
                
                <div className="user-role-row">
                  <span 
                    className="user-role"
                    style={{ color: getRoleColor(u.role) }}
                  >
                    {ROLES[u.role]?.label || 'Member'}
                  </span>
                  
                  <div className="permission-badges">
                    {hasPermission(u, 'read') && (
                      <span className="badge badge-read" title="Read">R</span>
                    )}
                    {hasPermission(u, 'write') && (
                      <span className="badge badge-write" title="Write">W</span>
                    )}
                    {u.role === 'leader' && (
                      <span className="badge badge-manage" title="Manage">M</span>
                    )}
                  </div>

                  {isLeader && u.id !== currentUser.id && (
                    <button 
                      className="btn-icon btn-menu"
                      onClick={() => togglePermissionMenu(u.id)}
                      title="Quản lý"
                    >
                      <FiMoreVertical />
                    </button>
                  )}
                </div>

                {/* Simplified Permission Menu */}
                {showPermissionMenu === u.id && (
                  <div className="permission-menu-simple">
                    <div className="menu-header">
                      <span>Quản lý: {u.name}</span>
                      <button onClick={() => setShowPermissionMenu(null)}>
                        <FiX />
                      </button>
                    </div>
                    
                    <div className="role-grid">
                      {Object.entries(ROLES).map(([key, role]) => (
                        key !== 'leader' && (
                          <button
                            key={key}
                            className={`role-btn ${u.role === key ? 'active' : ''}`}
                            onClick={() => handleRoleChange(u.id, key)}
                          >
                            {role.icon} {role.label}
                          </button>
                        )
                      ))}
                    </div>

                    <button
                      className="btn-transfer"
                      onClick={() => handleTransferLeadership(u.id)}
                    >
                      👑 Chuyển quyền Leader
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLeader && (
        <div className="role-legend">
          <h5>Hướng dẫn</h5>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-icon">👑</span>
              <span className="legend-text">Leader: Quản lý toàn bộ team</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🎨</span>
              <span className="legend-text">Designer: Thiết kế UI/UX</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">💻</span>
              <span className="legend-text">Developer: Lập trình viên</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">👤</span>
              <span className="legend-text">Member: Thành viên</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">👁️</span>
              <span className="legend-text">Viewer: Chỉ xem</span>
            </div>
          </div>
          <div className="permission-info">
            <p><strong>R</strong> = Read (Đọc) | <strong>W</strong> = Write (Ghi) | <strong>M</strong> = Manage (Quản lý)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPanel;
