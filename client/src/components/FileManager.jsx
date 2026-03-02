import { useState, useEffect, useRef } from 'react';
import { FiFile, FiFolder, FiPlus, FiUpload, FiTrash2, FiEdit2, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { getFiles, addFile, deleteFile, uploadFile, moveFile } from '../socket';
import './FileManager.css';

function FileManager({ documentId, currentFile, onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createMode, setCreateMode] = useState('file');
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [activeFolder, setActiveFolder] = useState(null);
  const [draggedFile, setDraggedFile] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileOrder, setFileOrder] = useState({}); // Store custom order: { fileName: order }
  const [renamingFile, setRenamingFile] = useState(null); // File being renamed
  const [renameValue, setRenameValue] = useState(''); // New name input

  const languageExtensions = {
    javascript: '.js',
    python: '.py',
    cpp: '.cpp',
    c: '.c',
    java: '.java',
    html: '.html',
    css: '.css',
    typescript: '.ts',
    json: '.json',
    markdown: '.md',
    text: '.txt'
  };

  useEffect(() => {
    if (documentId) {
      getFiles(documentId, (fileList) => {
        setFiles(fileList);
      });
    }
  }, [documentId]);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const ext = languageExtensions[selectedLanguage];
      const fileName = newFileName.trim().includes('.') 
        ? newFileName.trim() 
        : newFileName.trim() + ext;
      
      // If creating in folder, prepend folder path
      const fullPath = activeFolder ? `${activeFolder}/${fileName}` : fileName;
      
      addFile(documentId, fullPath);
      setNewFileName('');
      setShowCreateMenu(false);
      setActiveFolder(null);
    }
  };

  const handleCreateFileInFolder = (folderName) => {
    setActiveFolder(folderName);
    setCreateMode('file');
    setShowCreateMenu(true);
    setNewFileName('');
    // Auto expand folder
    setExpandedFolders(prev => ({ ...prev, [folderName]: true }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folderName = newFolderName.trim();
      console.log('Creating folder:', folderName); // Debug log
      addFile(documentId, `${folderName}/.folder`);
      setNewFolderName('');
      setShowCreateMenu(false);
      // Auto expand the new folder
      setExpandedFolders(prev => ({ ...prev, [folderName]: true }));
    }
  };

  const toggleFolder = (folderName, e) => {
    if (e) e.stopPropagation(); // Prevent any parent handlers
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Organize files into folders
  const organizeFiles = () => {
    const structure = { root: [] };
    
    files.forEach(file => {
      const parts = file.name.split('/');
      if (parts.length > 1) {
        // File in folder
        const folder = parts[0];
        if (!structure[folder]) {
          structure[folder] = [];
        }
        // Don't add .folder marker to file list, but keep folder in structure
        if (parts[1] !== '.folder') {
          structure[folder].push({ ...file, displayName: parts.slice(1).join('/') });
        }
      } else {
        // Root file
        structure.root.push({ ...file, displayName: file.name });
      }
    });
    
    // Sort files based on custom order
    const sortFiles = (fileList) => {
      return fileList.sort((a, b) => {
        const orderA = fileOrder[a.name] ?? 999999;
        const orderB = fileOrder[b.name] ?? 999999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Fallback to alphabetical
        return a.displayName.localeCompare(b.displayName);
      });
    };
    
    // Sort root files
    structure.root = sortFiles(structure.root);
    
    // Sort files in each folder
    Object.keys(structure).forEach(key => {
      if (key !== 'root') {
        structure[key] = sortFiles(structure[key]);
      }
    });
    
    return structure;
  };

  const fileStructure = organizeFiles();

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Preserve folder structure from webkitRelativePath
        const filePath = file.webkitRelativePath || file.name;
        uploadFile(documentId, filePath, event.target.result);
      };
      reader.readAsText(file);
    });
    
    // Reset input
    e.target.value = '';
  };

  const handleDelete = (fileName) => {
    if (confirm(`Xóa file "${fileName}"?`)) {
      deleteFile(documentId, fileName);
    }
  };

  // Rename handlers
  const startRename = (file, e) => {
    e.stopPropagation();
    setRenamingFile(file.name);
    setRenameValue(file.displayName); // Use displayName for files in folders
  };

  const handleRename = (oldFileName) => {
    if (!renameValue.trim() || renameValue === oldFileName) {
      setRenamingFile(null);
      return;
    }

    const newName = renameValue.trim();
    
    // Check if file is in folder
    const parts = oldFileName.split('/');
    const newFullPath = parts.length > 1 
      ? `${parts[0]}/${newName}` // Keep folder path
      : newName; // Root file

    // Get file content
    const file = files.find(f => f.name === oldFileName);
    if (file) {
      // Create new file with same content using uploadFile
      const content = file.content?.text || '';
      uploadFile(documentId, newFullPath, content);
      
      // Delete old file
      setTimeout(() => {
        deleteFile(documentId, oldFileName);
      }, 100);
      
      // If this was the current file, switch to new name
      if (oldFileName === currentFile) {
        setTimeout(() => {
          onFileSelect(newFullPath);
        }, 150);
      }
    }

    setRenamingFile(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingFile(null);
    setRenameValue('');
  };

  // Drag & Drop handlers
  const handleDragStart = (e, file) => {
    setDraggedFile(file);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(target);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDropTarget(null);
  };

  const handleDrop = async (e, targetFolder, targetFile = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);

    if (!draggedFile) return;

    const draggedPath = draggedFile.name;
    const draggedFolder = draggedPath.includes('/') ? draggedPath.split('/')[0] : 'root';

    // Check if this is a reorder operation (dropping on another file in same location)
    if (targetFile) {
      const targetPath = targetFile.name;
      const targetFileFolder = targetPath.includes('/') ? targetPath.split('/')[0] : 'root';
      
      // Only reorder if files are in the same location (both root or same folder)
      if (draggedFolder === targetFileFolder) {
        // Reorder files
        const newOrder = { ...fileOrder };
        const allFiles = files.map(f => f.name);
        
        // Assign orders if not exist
        allFiles.forEach((fileName, index) => {
          if (newOrder[fileName] === undefined) {
            newOrder[fileName] = index;
          }
        });
        
        // Swap orders
        const draggedOrder = newOrder[draggedPath];
        const targetOrder = newOrder[targetPath];
        newOrder[draggedPath] = targetOrder;
        newOrder[targetPath] = draggedOrder;
        
        setFileOrder(newOrder);
        setDraggedFile(null);
        setTimeout(() => setIsDragging(false), 100);
        return;
      }
      // If different locations, fall through to move logic
    }

    // Move logic (move to folder or root)
    const fileName = draggedFile.displayName || draggedFile.name.split('/').pop();
    const currentPath = draggedFile.name;
    
    let newPath;
    if (targetFolder === 'root') {
      newPath = fileName;
    } else if (targetFolder) {
      newPath = `${targetFolder}/${fileName}`;
    } else {
      setDraggedFile(null);
      setTimeout(() => setIsDragging(false), 100);
      return;
    }

    if (currentPath === newPath) {
      setDraggedFile(null);
      setIsDragging(false);
      return;
    }

    const existingFile = files.find(f => f.name === newPath);
    if (existingFile) {
      alert(`File "${fileName}" đã tồn tại trong folder này!`);
      setDraggedFile(null);
      setIsDragging(false);
      return;
    }

    try {
      await moveFile(documentId, currentPath, newPath);
      console.log(`Moved ${currentPath} to ${newPath}`);
      
      if (currentFile === currentPath) {
        onFileSelect(newPath);
      }
    } catch (error) {
      console.error('Error moving file:', error);
      alert('Lỗi khi di chuyển file!');
    }

    setDraggedFile(null);
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleDragEnd = (e) => {
    setDraggedFile(null);
    setDropTarget(null);
    // Delay resetting isDragging to prevent click event
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleFileClick = (fileName) => {
    // Don't select file if we just finished dragging
    if (isDragging) {
      return;
    }
    onFileSelect(fileName);
  };

  return (
    <div className="file-manager">
      <div className="file-header">
        <h3>Files</h3>
        <div className="file-actions">
          <button 
            onClick={() => {
              setShowCreateMenu(!showCreateMenu);
              if (!showCreateMenu) {
                // Reset form when opening
                setCreateMode('file');
                setActiveFolder(null);
                setNewFileName('');
                setNewFolderName('');
              }
            }} 
            title="Tạo file/folder mới"
            className={`create-btn ${showCreateMenu ? 'active' : ''}`}
          >
            <FiPlus />
          </button>
          
          <label title="Upload files/folder" className="upload-label">
            <FiUpload />
            <input 
              type="file" 
              onChange={handleUpload} 
              style={{ display: 'none' }}
              multiple
              webkitdirectory=""
              directory=""
            />
          </label>
          
          <label title="Upload files" className="upload-label">
            <FiFile />
            <input 
              type="file" 
              onChange={handleUpload} 
              style={{ display: 'none' }}
              multiple
            />
          </label>
        </div>
      </div>

      {showCreateMenu && (
        <div className="create-form-inline">
          <div className="form-tabs">
            <button 
              className={`tab-btn ${createMode === 'file' ? 'active' : ''}`}
              onClick={() => setCreateMode('file')}
            >
              <FiFile /> File
            </button>
            <button 
              className={`tab-btn ${createMode === 'folder' ? 'active' : ''}`}
              onClick={() => {
                setCreateMode('folder');
                setActiveFolder(null); // Reset active folder when switching to folder mode
              }}
            >
              <FiFolder /> Folder
            </button>
          </div>

          {createMode === 'file' ? (
            <div className="form-content">
              {activeFolder && (
                <div className="folder-indicator">
                  <FiFolder /> Tạo trong: <strong>{activeFolder}</strong>
                </div>
              )}
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-select"
              >
                <option value="javascript">JavaScript (.js)</option>
                <option value="python">Python (.py)</option>
                <option value="cpp">C++ (.cpp)</option>
                <option value="c">C (.c)</option>
                <option value="java">Java (.java)</option>
                <option value="html">HTML (.html)</option>
                <option value="css">CSS (.css)</option>
                <option value="typescript">TypeScript (.ts)</option>
                <option value="json">JSON (.json)</option>
                <option value="markdown">Markdown (.md)</option>
                <option value="text">Text (.txt)</option>
              </select>
              <input
                type="text"
                placeholder="Tên file (không cần đuôi)..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                className="form-input"
                autoFocus
              />
              <div className="form-actions">
                <button onClick={handleCreateFile} className="btn-create">
                  Tạo File
                </button>
                <button onClick={() => {
                  setShowCreateMenu(false);
                  setActiveFolder(null);
                }} className="btn-cancel">
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="form-content">
              <input
                type="text"
                placeholder="Tên folder..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="form-input"
                autoFocus
              />
              <div className="form-actions">
                <button onClick={handleCreateFolder} className="btn-create">
                  Tạo Folder
                </button>
                <button onClick={() => setShowCreateMenu(false)} className="btn-cancel">
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`file-list ${draggedFile && draggedFile.name.includes('/') ? 'accepting-drop' : ''}`}
        onDragOver={(e) => {
          // Allow drop anywhere in file-list to move to root
          if (draggedFile && draggedFile.name.includes('/')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDrop={(e) => {
          // Drop anywhere in file-list (not on specific file) moves to root
          if (draggedFile && draggedFile.name.includes('/')) {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e, 'root');
          }
        }}
      >
        {files.length === 0 ? (
          <div className="empty-state">
            <FiFile />
            <p>Chưa có file nào</p>
          </div>
        ) : (
          <>
            {/* Root files */}
            <div className="root-files">
              {fileStructure.root.map((file) => (
                <div
                  key={file.name}
                  className={`file-item ${currentFile === file.name ? 'active' : ''} ${draggedFile?.name === file.name ? 'dragging' : ''} ${dropTarget === file.name ? 'drop-target-file' : ''} ${renamingFile === file.name ? 'renaming' : ''}`}
                  onClick={() => renamingFile !== file.name && handleFileClick(file.name)}
                  draggable={renamingFile !== file.name}
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    if (draggedFile && draggedFile.name !== file.name) {
                      e.preventDefault();
                      e.stopPropagation();
                      setDropTarget(file.name);
                    }
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, null, file);
                  }}
                >
                  <FiFile className="file-icon" />
                  {renamingFile === file.name ? (
                    <input
                      type="text"
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRename(file.name);
                        } else if (e.key === 'Escape') {
                          cancelRename();
                        }
                      }}
                      onBlur={() => handleRename(file.name)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="file-name">{file.displayName}</span>
                  )}
                  <div className="file-item-actions">
                    <button
                      className="rename-btn"
                      onClick={(e) => startRename(file, e)}
                      title="Đổi tên file"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.name);
                      }}
                      title="Xóa file"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Folders */}
            {Object.keys(fileStructure).filter(k => k !== 'root').map(folderName => {
              const folderFiles = fileStructure[folderName];
              const hasFiles = folderFiles.length > 0;
              
              return (
                <div key={folderName} className="folder-container">
                  <div 
                    className={`folder-item ${dropTarget === folderName ? 'drop-target' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(folderName);
                    }}
                    onDragOver={(e) => handleDragOver(e, folderName)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folderName)}
                  >
                    {expandedFolders[folderName] ? <FiChevronDown /> : <FiChevronRight />}
                    <FiFolder className="folder-icon" />
                    <span className="folder-name">{folderName}</span>
                    <div className="folder-actions">
                      <button
                        className="add-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFileInFolder(folderName);
                        }}
                        title="Tạo file trong folder"
                      >
                        <FiPlus />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Xóa folder "${folderName}"${hasFiles ? ' và tất cả files bên trong' : ''}?`)) {
                            folderFiles.forEach(f => deleteFile(documentId, f.name));
                            deleteFile(documentId, `${folderName}/.folder`);
                          }
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  {expandedFolders[folderName] && (
                    <div className="folder-contents">
                      {hasFiles ? (
                        folderFiles.map((file) => (
                          <div
                            key={file.name}
                            className={`file-item nested ${currentFile === file.name ? 'active' : ''} ${draggedFile?.name === file.name ? 'dragging' : ''} ${dropTarget === file.name ? 'drop-target-file' : ''} ${renamingFile === file.name ? 'renaming' : ''}`}
                            onClick={() => renamingFile !== file.name && handleFileClick(file.name)}
                            draggable={renamingFile !== file.name}
                            onDragStart={(e) => handleDragStart(e, file)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              if (draggedFile && draggedFile.name !== file.name) {
                                e.preventDefault();
                                e.stopPropagation();
                                setDropTarget(file.name);
                              }
                            }}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDrop(e, null, file);
                            }}
                          >
                            <FiFile className="file-icon" />
                            {renamingFile === file.name ? (
                              <input
                                type="text"
                                className="rename-input"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRename(file.name);
                                  } else if (e.key === 'Escape') {
                                    cancelRename();
                                  }
                                }}
                                onBlur={() => handleRename(file.name)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="file-name">{file.displayName}</span>
                            )}
                            <div className="file-item-actions">
                              <button
                                className="rename-btn"
                                onClick={(e) => startRename(file, e)}
                                title="Đổi tên file"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(file.name);
                                }}
                                title="Xóa file"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div 
                          className={`empty-folder ${dropTarget === folderName ? 'drop-target' : ''}`}
                          onDragOver={(e) => handleDragOver(e, folderName)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, folderName)}
                        >
                          <span>Folder rỗng - Kéo file vào đây</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default FileManager;
