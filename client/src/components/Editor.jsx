import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { getFileContent, updateContent, updateCursor, getFiles } from '../socket';
import InteractiveTerminal from './InteractiveTerminal';
import DownloadModal from './DownloadModal';
import NotificationBell from './NotificationBell';
import FriendsList from './FriendsList';
import { FiSave, FiDownload, FiSun, FiMoon, FiUsers } from 'react-icons/fi';
import './Editor.css';

function Editor({ documentId, projectName, user, users, currentFile, theme: appTheme, onThemeChange, authUser, userProfile, onProjectJoin }) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [cursors, setCursors] = useState({});
  const [showCursors, setShowCursors] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [outputHeight, setOutputHeight] = useState(200);
  const [loading, setLoading] = useState(true);
  const [runTrigger, setRunTrigger] = useState(0);
  const [codeToRun, setCodeToRun] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const isRemoteChange = useRef(false);
  const updateTimeoutRef = useRef(null);
  const isComposingRef = useRef(false);
  
  // Use theme from App or fallback to local
  const theme = appTheme || localStorage.getItem('editorTheme') || 'vs-dark';

  useEffect(() => {
    if (!documentId || !currentFile) return;

    setLoading(true);
    getFileContent(documentId, currentFile, (data) => {
      if (data && data.text) {
        isRemoteChange.current = true;
        setContent(data.text);
      } else {
        setContent('// Bắt đầu code...\n');
      }
      setLoading(false);
    });
    
    // Save last opened file
    localStorage.setItem(`lastFile_${documentId}`, currentFile);
    
    // Cleanup timeout on unmount or file change
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
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

  useEffect(() => {
    if (!editorRef.current || !showCursors) {
      decorationsRef.current = editorRef.current?.deltaDecorations(decorationsRef.current, []) || [];
      return;
    }

    const newDecorations = Object.entries(cursors)
      .filter(([userId]) => userId !== user?.id)
      .map(([userId, cursor]) => {
        const userData = users.find(u => u.id === userId);
        const color = userData?.color || '#999';
        
        return {
          range: new window.monaco.Range(cursor.line, cursor.column, cursor.line, cursor.column + 1),
          options: {
            className: 'remote-cursor',
            stickiness: 1,
            zIndex: 1000
          }
        };
      });

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
  }, [cursors, showCursors, users, user]);

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
    
    // Debounce update to Firebase - wait 300ms after last keystroke
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Don't sync while composing Vietnamese characters
    if (!isComposingRef.current && documentId && currentFile) {
      updateTimeoutRef.current = setTimeout(() => {
        updateContent(documentId, currentFile, value);
      }, 300);
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
          // Sync after composition ends
          if (documentId && currentFile && content) {
            updateContent(documentId, currentFile, content);
          }
        });
      }
    }
    
    editor.onDidChangeCursorPosition((e) => {
      if (documentId && user) {
        updateCursor(documentId, user.id, e.position);
      }
    });

    // Keyboard shortcut: Ctrl+Enter to run
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, () => {
      handleRun();
    });

    if (!document.getElementById('cursor-styles')) {
      const style = document.createElement('style');
      style.id = 'cursor-styles';
      style.textContent = `
        .remote-cursor {
          border-left: 2px solid;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);
    }
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
            <button 
              className="download-btn"
              onClick={handleDownload}
              title="Tải về máy"
            >
              <FiDownload /> Download
            </button>
          )}
          
          <button 
            className="theme-btn"
            onClick={handleThemeChange}
            title={`Theme: ${getThemeName()}`}
          >
            {getThemeIcon()} {getThemeName()}
          </button>
          
          <label className="cursor-toggle">
            <input 
              type="checkbox" 
              checked={showCursors} 
              onChange={(e) => setShowCursors(e.target.checked)}
            />
            Hiện cursor
          </label>
          
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
            readOnly: !user?.permissions?.includes('write'),
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
