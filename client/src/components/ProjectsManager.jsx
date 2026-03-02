import { useState, useEffect } from 'react';
import { FiTrash2, FiShare2, FiClock, FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { getUserProjects, deleteUserProject } from '../firebase';
import './ProjectsManager.css';

function ProjectsManager({ userId, onClose, onJoinProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareProjectCode, setShareProjectCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { projectCode, verificationCode }
  const [verificationInput, setVerificationInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    try {
      const userProjects = await getUserProjects(userId);
      // Sort by lastAccessed
      const sorted = userProjects.sort((a, b) => b.lastAccessed - a.lastAccessed);
      setProjects(sorted);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectCode) => {
    // Generate random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setDeleteConfirm({ projectCode, verificationCode });
    setVerificationInput('');
  };

  const confirmDelete = async () => {
    if (verificationInput === deleteConfirm.verificationCode) {
      try {
        await deleteUserProject(userId, deleteConfirm.projectCode);
        setProjects(projects.filter(p => p.code !== deleteConfirm.projectCode));
        setDeleteConfirm(null);
        setVerificationInput('');
      } catch (error) {
        alert('Lỗi khi xóa project: ' + error.message);
      }
    } else {
      alert('Mã xác nhận không đúng!');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
    setVerificationInput('');
  };

  const handleShare = (projectCode) => {
    setShareProjectCode(projectCode);
    navigator.clipboard.writeText(projectCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShareProjectCode('');
    }, 2000);
  };

  const handleJoin = (project) => {
    // Pass project code, role, and name to parent
    onJoinProject(project.code, project.role || 'member', project.name);
    onClose();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="projects-overlay">
      <div className="projects-modal">
        <div className="projects-header">
          <h2>Projects của bạn</h2>
          <button className="btn-close-projects" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="projects-content">
          {loading ? (
            <div className="projects-loading">
              <div className="spinner"></div>
              <p>Đang tải projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="projects-empty">
              <p>Bạn chưa có project nào</p>
              <p className="hint">Tạo project mới để bắt đầu!</p>
            </div>
          ) : (
            <div className="projects-list">
              {projects.map((project) => (
                <div key={project.code} className="project-card">
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <div className="project-meta">
                      <span className="project-code">{project.code}</span>
                      <span className="project-time">
                        <FiClock size={12} /> {formatDate(project.lastAccessed)}
                      </span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button
                      className="btn-action btn-join"
                      onClick={() => handleJoin(project)}
                      title="Mở project"
                    >
                      Mở
                    </button>
                    <button
                      className="btn-action btn-share"
                      onClick={() => handleShare(project.code)}
                      title="Share project"
                    >
                      {shareProjectCode === project.code && copied ? (
                        <FiCheck />
                      ) : (
                        <FiShare2 />
                      )}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(project.code)}
                      title="Xóa project"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Xác nhận xóa project</h3>
              <button className="close-btn" onClick={cancelDelete}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                Hành động này không thể hoàn tác! Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
              </p>
              <p className="instruction-text">
                Nhập mã xác nhận để tiếp tục:
              </p>
              <div className="verification-code">
                {deleteConfirm.verificationCode}
              </div>
              <input
                type="text"
                className="verification-input"
                placeholder="Nhập mã xác nhận..."
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && confirmDelete()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={cancelDelete}>
                Hủy
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={confirmDelete}
                disabled={!verificationInput}
              >
                Xóa Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsManager;
