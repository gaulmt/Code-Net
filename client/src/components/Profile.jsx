import { useState } from 'react';
import { FiCamera, FiSave, FiX } from 'react-icons/fi';
import './Profile.css';

function Profile({ user, onSave, onClose }) {
  const [avatarUrl, setAvatarUrl] = useState(user.photoURL || '');
  const [previewUrl, setPreviewUrl] = useState(user.photoURL || '');

  const handleSave = () => {
    onSave(previewUrl);
  };

  const handleAvatarChange = (e) => {
    const url = e.target.value;
    setAvatarUrl(url);
    if (url) {
      setPreviewUrl(url);
    }
  };

  const generateAvatar = () => {
    const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'pixel-art'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = user.username + Date.now();
    const url = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
    setPreviewUrl(url);
    setAvatarUrl(url);
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>Chỉnh sửa Profile</h2>
          <button className="btn-close-profile" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-preview">
              <img src={previewUrl} alt={user.username} />
              <div className="avatar-overlay">
                <FiCamera size={24} />
              </div>
            </div>
            <p className="username-display">@{user.username}</p>
          </div>

          <div className="avatar-options">
            <button className="btn-generate" onClick={generateAvatar}>
              🎲 Tạo Avatar Ngẫu Nhiên
            </button>
            
            <div className="input-group">
              <label>Hoặc nhập URL ảnh:</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="avatar-suggestions">
              <p>Gợi ý:</p>
              <div className="suggestion-grid">
                {['adventurer', 'avataaars', 'bottts', 'fun-emoji'].map(style => (
                  <img
                    key={style}
                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=${user.username}`}
                    alt={style}
                    onClick={() => {
                      const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${user.username}`;
                      setPreviewUrl(url);
                      setAvatarUrl(url);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-save" onClick={handleSave}>
            <FiSave /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
