import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { getFileContent, updateContent, getFiles, lockFile, unlockFile, getFileLock } from '../socket';
import InteractiveTerminal from './InteractiveTerminal';
import DownloadModal from './DownloadModal';
import NotificationBell from './NotificationBell';
import FriendsList from './FriendsList';
import { FiSave, FiDownload, FiSun, FiMoon, FiUsers } from 'react-icons/fi';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './Editor.css';

function Editor({ documentId, projectName, user, users, currentFile, theme: appTheme, onThemeChange, authUser, userProfile, onProjectJoin }) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showOutput, setShowOutput] = useState(false);
  const [outputHeight, setOutputHeight] = useState(200);
  const [loading, setLoading] = useState(true);
  const [runTrigger, setRunTrigger] = useState(0);
  const [codeToRun, setCodeToRun] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [fileLock, setFileLock] = useState(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const updateTimeoutRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastSyncedContent = useRef('');
  const lockListenerRef = useRef(null);
  
  // Use theme from App or fallback to local
  const theme = appTheme || localStorage.getItem('editorTheme') || 'vs-dark';

  useEffect(() => {
    if (!documentId || !currentFile) return;

    setLoading(true);
    getFileContent(documentId, currentFile, (data) => {
      if (data && data.text) {
        isRemoteChange.current = true;
        setContent(data.text);
        lastSyncedContent.current = data.text;
      } else {
        setContent('// Bắt đầu code...\n');
        lastSyncedContent.current = '// Bắt đầu code...\n';
      }
      setLoading(false);
    });
    
    // Listen to file lock status
    if (lockListenerRef.current) {
      lockListenerRef.current(); // Unsubscribe previous listener
    }
    
    lockListenerRef.current = getFileLock(documentId, currentFile, (lockData) => {
      setFileLock(lockData);
    });
    
    // Save last opened file
    localStorage.setItem(`lastFile_${documentId}`, currentFile);
    
    // Cleanup timeout on unmount or file change
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (lockListenerRef.current) {
        lockListenerRef.current();
      }
    };
  }, [documentId, currentFile]);

  // Load all files for download modal
  useEffect(() => {
    if (!documentId) return;
    
    getFiles(documentId, (files) => {
      setAllFiles(files);
    });
  }, [documentId]);

  // Close sync modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSyncModal && !e.target.closest('.sync-dropdown')) {
        setShowSyncModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSyncModal]);

  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    
    // Check write permission
    if (!user?.permissions?.includes('write')) {
      return;
    }
    
    setContent(value);
  };

  // Manual sync with file locking
  const syncNow = async () => {
    if (!documentId || !currentFile || !content) return;
    if (content === lastSyncedContent.current) return;
    if (isComposingRef.current) return;
    
    try {
      setSyncing(true);
      
      // Lock the file
      await lockFile(documentId, currentFile, user.id, user.name);
      
      // Wait a bit to ensure lock is propagated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update content
      await updateContent(documentId, currentFile, content);
      lastSyncedContent.current = content;
      
      // Wait a bit before unlocking
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Unlock the file
      await unlockFile(documentId, currentFile);
      
      setSyncing(false);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncing(false);
      // Ensure unlock even on error
      await unlockFile(documentId, currentFile);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
    // Handle Vietnamese input composition
    const domNode = editor.getDomNode();
    if (domNode) {
      const textArea = domNode.querySelector('textarea');
      if (textArea) {
        textArea.addEventListener('compositionstart', () => {
          isComposingRef.current = true;
        });
        
        textArea.addEventListener('compositionend', () => {
          isComposingRef.current = false;
        });
      }
    }

    // Keyboard shortcut: Ctrl+Enter to run
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, () => {
      handleRun();
    });

    // Keyboard shortcut: Ctrl+S to save/sync
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => {
      syncNow();
    });
  };

  const handleRun = () => {
    // Get latest content from editor
    if (editorRef.current) {
      const latestContent = editorRef.current.getValue();
      setContent(latestContent);
      setCodeToRun(latestContent); // Set code to run
    }
    setShowOutput(true);
    setRunTrigger(prev => prev + 1);
  };

  const handleSaveToCloud = async () => {
    if (!documentId || !currentFile) return;
    
    setSaving(true);
    try {
      // Get latest content from editor
      const latestContent = editorRef.current ? editorRef.current.getValue() : content;
      
      // Save to Firebase
      await updateContent(documentId, currentFile, latestContent);
      setContent(latestContent);
      
      // Show success feedback
      const btn = document.querySelector('.save-cloud-btn');
      if (btn) {
        btn.classList.add('saved');
        setTimeout(() => btn.classList.remove('saved'), 2000);
      }
    } catch (error) {
      alert('Lỗi khi lưu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const handleDownloadFiles = async (selectedFiles) => {
    for (const fileName of selectedFiles) {
      try {
        // Get file content from Firebase
        await new Promise((resolve) => {
          getFileContent(documentId, fileName, (data) => {
            const fileContent = data?.text || '';
            
            // Download file
            const blob = new Blob([fileContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            resolve();
          });
        });
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error downloading ${fileName}:`, error);
      }
    }
  };

  const handleDownloadZip = async (selectedFiles) => {
    try {
      const zip = new JSZip();
      
      // Add all selected files to ZIP with folder structure
      for (const fileName of selectedFiles) {
        await new Promise((resolve) => {
          getFileContent(documentId, fileName, (data) => {
            const fileContent = data?.text || '';
            // fileName already includes folder path (e.g., "src/App.jsx")
            zip.file(fileName, fileContent);
            resolve();
          });
        });
      }
      
      // Generate ZIP file
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Save ZIP file
      const zipName = projectName ? `${projectName}.zip` : `project-${documentId}.zip`;
      saveAs(blob, zipName);
      
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Lỗi khi tạo file ZIP: ' + error.message);
    }
  };

  const handleThemeChange = () => {
    const themes = ['vs-dark', 'vs-light', 'hc-black'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    // Add transition effect
    const editorContainer = document.querySelector('.editor-content');
    if (editorContainer) {
      editorContainer.classList.add('theme-transitioning');
      setTimeout(() => {
        editorContainer.classList.remove('theme-transitioning');
      }, 300);
    }
    
    // Update theme in App
    if (onThemeChange) {
      onThemeChange(nextTheme);
      localStorage.setItem('appTheme', nextTheme);
    }
  };

  const getThemeIcon = () => {
    if (theme === 'vs-light') return <FiSun />;
    if (theme === 'hc-black') return '🌓';
    return <FiMoon />;
  };

  const getThemeName = () => {
    if (theme === 'vs-light') return 'Light';
    if (theme === 'hc-black') return 'High Contrast';
    return 'Dark';
  };

  const handleResizeOutput = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = outputHeight;

    let animationFrameId = null;

    const onMouseMove = (e) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const diff = startY - e.clientY;
        const newHeight = Math.max(150, Math.min(500, startHeight + diff));
        setOutputHeight(newHeight);
      });
    };

    const onMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const getLanguageFromFile = (fileName) => {
    const ext = fileName.split('.').pop();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'json': 'json'
    };
    return langMap[ext] || 'javascript';
  };

  useEffect(() => {
    if (currentFile) {
      setLanguage(getLanguageFromFile(currentFile));
    }
  }, [currentFile]);

  if (loading) {
    return (
      <div className="editor-container">
        <div className="editor-loading">
          <div className="spinner-small"></div>
          <p>Đang tải file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-header-left">
          {projectName && (
            <>
              <span className="project-name">{projectName}</span>
              <span className="separator">/</span>
            </>
          )}
          <span className="current-file">{currentFile}</span>
          {syncing && (
            <span className="sync-indicator-large" title="Đang đồng bộ...">
              <span className="sync-spinner"></span> Đang đồng bộ với mọi người...
            </span>
          )}
          {!syncing && fileLock?.isLocked && fileLock.lockedBy !== user?.id && (
            <span className="locked-indicator" title={`${fileLock.lockedByName} đang đồng bộ`}>
              <span className="sync-spinner"></span> {fileLock.lockedByName} đang đồng bộ...
            </span>
          )}
          {!syncing && !fileLock?.isLocked && content !== lastSyncedContent.current && user?.permissions?.includes('write') && (
            <span className="unsaved-indicator" title="Có thay đổi chưa lưu">
              ● Chưa lưu
            </span>
          )}
        </div>
        <div className="editor-controls">
          {/* Notification Bell */}
          {authUser && userProfile && (
            <NotificationBell 
              userId={authUser.uid}
              userProfile={userProfile}
              onProjectJoin={onProjectJoin}
            />
          )}
          
          {/* Friends List Button */}
          {authUser && userProfile && (
            <button 
              className="friends-btn"
              onClick={() => setShowFriendsList(true)}
              title="Bạn bè"
            >
              <FiUsers size={20} />
            </button>
          )}
          
          {!user?.permissions?.includes('write') && (
            <span className="read-only-badge">🔒 Chỉ đọc</span>
          )}
          
          {user?.permissions?.includes('write') && (
            <>
              <div className="sync-dropdown">
                <button 
                  className={`save-btn-primary ${syncing ? 'syncing' : ''}`}
                  onClick={syncNow}
                  title="Đồng bộ file hiện tại (Ctrl+S)"
                  disabled={syncing || content === lastSyncedContent.current}
                >
                  <FiSave /> {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
                </button>
                <button 
                  className="sync-dropdown-btn"
                  onClick={() => setShowSyncModal(!showSyncModal)}
                  title="Chọn files để đồng bộ"
                  disabled={syncing}
                >
                  ▼
                </button>
                {showSyncModal && (
                  <div className="sync-modal-dropdown">
                    <div className="sync-modal-header">Chọn file để đồng bộ</div>
                    <div className="sync-modal-options">
                      <button 
                        className="sync-option"
                        onClick={() => {
                          syncNow();
                          setShowSyncModal(false);
                        }}
                      >
                        <FiSave /> File hiện tại: {currentFile}
                      </button>
                      <button 
                        className="sync-option"
                        onClick={() => {
                          // TODO: Implement sync all files
                          alert('Tính năng đồng bộ tất cả files đang được phát triển');
                          setShowSyncModal(false);
                        }}
                      >
                        📁 Tất cả files trong project
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="download-btn"
                onClick={handleDownload}
                title="Tải về máy"
              >
                <FiDownload /> Download
              </button>
            </>
          )}
          
          <button 
            className="theme-btn"
            onClick={handleThemeChange}
            title={`Theme: ${getThemeName()}`}
          >
            {getThemeIcon()} {getThemeName()}
          </button>
          
          {user?.permissions?.includes('write') && (
            <button 
              className="run-code-btn"
              onClick={handleRun}
              title="Chạy code (Ctrl+Enter)"
            >
              ▶ Run
            </button>
          )}
        </div>
      </div>
      <div className="editor-content" style={{ height: showOutput ? `calc(100% - ${outputHeight + 40}px)` : 'calc(100% - 40px)' }}>
        <MonacoEditor
          height="100%"
          language={language}
          theme={theme}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            readOnly: !user?.permissions?.includes('write') || (fileLock?.isLocked && fileLock.lockedBy !== user?.id),
            // Fix Vietnamese input issue
            quickSuggestions: false,
            acceptSuggestionOnCommitCharacter: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            wordBasedSuggestions: false,
            // Improve composition (Vietnamese typing)
            renderWhitespace: 'selection',
            renderControlCharacters: false
          }}
        />
      </div>
      {showOutput && (
        <div className="output-container" style={{ height: `${outputHeight}px` }}>
          <div className="output-resize-handle" onMouseDown={handleResizeOutput} />
          <InteractiveTerminal 
            code={codeToRun} 
            language={language} 
            runTrigger={runTrigger} 
            onClose={() => setShowOutput(false)}
            projectName={projectName}
            documentId={documentId}
          />
        </div>
      )}
      
      {showDownloadModal && (
        <DownloadModal
          files={allFiles}
          currentFile={currentFile}
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownloadFiles}
          onDownloadZip={handleDownloadZip}
          projectName={projectName}
        />
      )}
      
      {showFriendsList && authUser && userProfile && (
        <FriendsList
          userId={authUser.uid}
          userProfile={userProfile}
          onClose={() => setShowFriendsList(false)}
          onSendMessage={(friendId) => {
            console.log('Send message to:', friendId);
            // TODO: Implement messaging
          }}
        />
      )}
    </div>
  );
}

export default Editor;
