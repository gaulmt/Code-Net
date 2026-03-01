import { useState, useEffect } from 'react';
import { FiFile, FiFolder, FiPlus, FiUpload, FiTrash2, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { getFiles, addFile, deleteFile, uploadFile } from '../socket';
import './FileManager.css';

function FileManager({ documentId, currentFile, onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    if (documentId) {
      getFiles(documentId, (fileList) => {
        setFiles(fileList);
      });
    }
  }, [documentId]);

  const handleAddFile = () => {
    if (newFileName.trim()) {
      addFile(documentId, newFileName.trim());
      setNewFileName('');
      setShowAddFile(false);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadFile(documentId, file.name, event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleDelete = (fileName) => {
    if (confirm(`Xóa file "${fileName}"?`)) {
      deleteFile(documentId, fileName);
    }
  };

  return (
    <div className="file-manager">
      <div className="file-header">
        <h3>Files</h3>
        <div className="file-actions">
          <button onClick={() => setShowAddFile(!showAddFile)} title="Tạo file mới">
            <FiPlus />
          </button>
          <label title="Upload file">
            <FiUpload />
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {showAddFile && (
        <div className="add-file-form">
          <input
            type="text"
            placeholder="Tên file..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFile()}
            autoFocus
          />
          <button onClick={handleAddFile}>Tạo</button>
        </div>
      )}

      <div className="file-list">
        {files.length === 0 ? (
          <div className="empty-state">
            <FiFile />
            <p>Chưa có file nào</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.name}
              className={`file-item ${currentFile === file.name ? 'active' : ''}`}
              onClick={() => onFileSelect(file.name)}
            >
              <FiFile className="file-icon" />
              <span className="file-name">{file.name}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file.name);
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FileManager;
