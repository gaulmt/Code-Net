import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { getFileContent, updateContent, updateCursor } from '../socket';
import CodeRunner from './CodeRunner';
import './Editor.css';

function Editor({ documentId, user, users, currentFile }) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [cursors, setCursors] = useState({});
  const [showCursors, setShowCursors] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [outputHeight, setOutputHeight] = useState(200);
  const [loading, setLoading] = useState(true);
  const [runTrigger, setRunTrigger] = useState(0);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const isRemoteChange = useRef(false);

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
  }, [documentId, currentFile]);

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
    if (documentId && currentFile) {
      updateContent(documentId, currentFile, value);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
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
    setShowOutput(true);
    setRunTrigger(prev => prev + 1);
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
        <span className="current-file">{currentFile}</span>
        <div className="editor-controls">
          {!user?.permissions?.includes('write') && (
            <span className="read-only-badge">🔒 Chỉ đọc</span>
          )}
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
          theme="vs-dark"
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
            readOnly: !user?.permissions?.includes('write')
          }}
        />
      </div>
      {showOutput && (
        <div className="output-container" style={{ height: `${outputHeight}px` }}>
          <div className="output-resize-handle" onMouseDown={handleResizeOutput} />
          <CodeRunner code={content} language={language} runTrigger={runTrigger} onClose={() => setShowOutput(false)} />
        </div>
      )}
    </div>
  );
}

export default Editor;
