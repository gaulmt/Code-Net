import { useState } from 'react';
import { FiX, FiFile, FiFolder } from 'react-icons/fi';
import './CreateFileModal.css';

function CreateFileModal({ onClose, onCreateFile, onCreateFolder }) {
  const [mode, setMode] = useState('file'); // 'file' or 'folder'
  const [fileName, setFileName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const languages = [
    { value: 'javascript', label: 'JavaScript', ext: '.js' },
    { value: 'python', label: 'Python', ext: '.py' },
    { value: 'cpp', label: 'C++', ext: '.cpp' },
    { value: 'c', label: 'C', ext: '.c' },
    { value: 'java', label: 'Java', ext: '.java' },
    { value: 'html', label: 'HTML', ext: '.html' },
    { value: 'css', label: 'CSS', ext: '.css' },
    { value: 'typescript', label: 'TypeScript', ext: '.ts' },
    { value: 'json', label: 'JSON', ext: '.json' },
    { value: 'markdown', label: 'Markdown', ext: '.md' },
    { value: 'text', label: 'Text', ext: '.txt' }
  ];

  const handleCreate = () => {
    if (!fileName.trim()) {
      alert('Vui lòng nhập tên!');
      return;
    }

    if (mode === 'file') {
      const lang = languages.find(l => l.value === selectedLanguage);
      const fullName = fileName.trim().includes('.') 
        ? fileName.trim() 
        : fileName.trim() + lang.ext;
      onCreateFile(fullName);
    } else {
      onCreateFolder(fileName.trim());
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-file-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo mới</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Mode selector */}
          <div className="mode-selector">
            <button 
              className={`mode-btn ${mode === 'file' ? 'active' : ''}`}
              onClick={() => setMode('file')}
            >
              <FiFile /> File
            </button>
            <button 
              className={`mode-btn ${mode === 'folder' ? 'active' : ''}`}
              onClick={() => setMode('folder')}
            >
              <FiFolder /> Folder
            </button>
          </div>

          {/* File creation */}
          {mode === 'file' && (
            <div className="create-form">
              <div className="form-group">
                <label>Ngôn ngữ:</label>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-select"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label} ({lang.ext})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tên file:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: main (không cần đuôi)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <small className="hint">
                  Sẽ tạo: {fileName.trim() || 'main'}{languages.find(l => l.value === selectedLanguage)?.ext}
                </small>
              </div>
            </div>
          )}

          {/* Folder creation */}
          {mode === 'folder' && (
            <div className="create-form">
              <div className="form-group">
                <label>Tên folder:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: src, components, utils..."
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <small className="hint">
                  Folder giúp tổ chức files theo nhóm
                </small>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button className="create-btn" onClick={handleCreate}>
            Tạo {mode === 'file' ? 'File' : 'Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFileModal;
