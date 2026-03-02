import { useState } from 'react';
import { FiX, FiDownload, FiFile } from 'react-icons/fi';
import './DownloadModal.css';

function DownloadModal({ files, currentFile, onClose, onDownload }) {
  const [selectedFiles, setSelectedFiles] = useState([currentFile]);
  const [downloadAll, setDownloadAll] = useState(false);

  const toggleFile = (fileName) => {
    if (selectedFiles.includes(fileName)) {
      setSelectedFiles(selectedFiles.filter(f => f !== fileName));
    } else {
      setSelectedFiles([...selectedFiles, fileName]);
    }
  };

  const toggleAll = () => {
    if (downloadAll) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.name));
    }
    setDownloadAll(!downloadAll);
  };

  const handleDownload = () => {
    if (selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất 1 file');
      return;
    }
    onDownload(selectedFiles);
    onClose();
  };

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={(e) => e.stopPropagation()}>
        <div className="download-modal-header">
          <h3>Tải xuống files</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="download-modal-content">
          <div className="download-option">
            <label className="download-checkbox">
              <input
                type="checkbox"
                checked={downloadAll}
                onChange={toggleAll}
              />
              <span className="checkbox-label">Tải tất cả files</span>
            </label>
          </div>

          <div className="files-list">
            {files.map((file) => (
              <div key={file.name} className="file-item">
                <label className="download-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.name)}
                    onChange={() => toggleFile(file.name)}
                  />
                  <FiFile className="file-icon" />
                  <span className="file-name">{file.name}</span>
                  {file.name === currentFile && (
                    <span className="current-badge">Đang mở</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="download-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button className="download-btn-modal" onClick={handleDownload}>
            <FiDownload /> Tải xuống ({selectedFiles.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadModal;
