import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiX, FiCpu, FiCloud, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import './CodeRunner.css';

function CodeRunner({ code, language, runTrigger, onClose }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useWasm, setUseWasm] = useState(true); // Default to WASM
  const pyodideRef = useRef(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (runTrigger > 0) {
      runCode();
    }
  }, [runTrigger]);

  const runCode = async () => {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      console.log('Running code:', { language, codeLength: code.length, useWasm });
      
      // Check if WASM is available for this language
      if (useWasm && canUseWasm(language)) {
        await runWithWasm();
      } else {
        await runWithAPI();
      }
    } catch (err) {
      console.error('Run error:', err);
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canUseWasm = (lang) => {
    // Chỉ hiện toggle WASM/API cho các ngôn ngữ có WASM support
    return ['javascript', 'python', 'html'].includes(lang);
  };

  const runWithWasm = async () => {
    if (language === 'javascript') {
      await runJavaScriptWasm();
    } else if (language === 'python') {
      await runPythonWasm();
    } else if (language === 'html') {
      await runHTMLWasm();
    }
  };

  const runJavaScriptWasm = async () => {
    try {
      // Capture console output
      const logs = [];
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      };

      // Execute code in isolated scope
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(code);
      const result = await fn();
      
      // Restore console
      console.log = originalLog;
      console.error = originalError;

      if (result !== undefined) {
        logs.push(String(result));
      }

      if (logs.length > 0) {
        setOutput(logs.join('\n'));
      } else {
        setOutput('✓ Code chạy thành công (không có output)');
      }
    } catch (err) {
      setError(`JavaScript Error: ${err.message}\n${err.stack || ''}`);
    }
  };

  const runHTMLWasm = async () => {
    try {
      setHtmlPreview(code);
      setOutput('✓ HTML đã được render trong preview');
      
      // Update iframe content
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
      }
    } catch (err) {
      setError(`HTML Error: ${err.message}`);
    }
  };

  const loadPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;
    
    setPyodideLoading(true);
    try {
      // Load Pyodide from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });

      pyodideRef.current = pyodide;
      setPyodideLoading(false);
      return pyodide;
    } catch (err) {
      setPyodideLoading(false);
      throw new Error('Không thể tải Pyodide. Đang chuyển sang API...');
    }
  };

  const runPythonWasm = async () => {
    try {
      setOutput('⏳ Đang tải Python WebAssembly lần đầu (có thể mất vài giây)...');
      
      const pyodide = await loadPyodide();
      
      setOutput('⏳ Đang chạy code Python...');

      // Redirect stdout
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Run user code
      await pyodide.runPythonAsync(code);

      // Get output
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

      if (stderr) {
        setError(stderr);
      }
      if (stdout) {
        setOutput(stdout);
      }
      if (!stdout && !stderr) {
        setOutput('✓ Code chạy thành công (không có output)');
      }
    } catch (err) {
      // Fallback to API if WASM fails
      console.error('Pyodide error:', err);
      setOutput('');
      await runWithAPI();
    }
  };

  const runWithAPI = async () => {
    // Hiện tại các API compiler miễn phí đều có hạn chế:
    // - EMKC Piston: Whitelist only (2/15/2026)
    // - OneCompiler: CORS issues
    // - JDoodle: Cần API key
    // - Judge0: Cần API key
    
    setError(
      `⚠️ API Mode hiện không khả dụng\n\n` +
      `Các compiler API miễn phí đã bị giới hạn hoặc yêu cầu đăng ký.\n\n` +
      `📌 Giải pháp:\n\n` +
      `1. Dùng WASM mode cho JavaScript, Python, HTML\n` +
      `   → Chạy nhanh và không cần API\n\n` +
      `2. Với C++/Java/C:\n` +
      `   → Cài compiler trên máy (GCC, MinGW, JDK)\n` +
      `   → Hoặc dùng online compiler: \n` +
      `      • https://www.onlinegdb.com\n` +
      `      • https://www.programiz.com/cpp-programming/online-compiler\n` +
      `      • https://godbolt.org\n\n` +
      `3. Tự host Piston API:\n` +
      `   → https://github.com/engineer-man/piston\n` +
      `   → Deploy trên server riêng (free tier Heroku/Railway)`
    );
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
    setHtmlPreview('');
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write('');
      iframeDoc.close();
    }
  };

  const togglePreviewSize = () => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };

  return (
    <div className="code-runner">
      <div className="runner-header">
        <h4>Terminal</h4>
        <div className="runner-actions">
          {canUseWasm(language) && (
            <div className="execution-mode">
              <button
                className={`mode-btn ${useWasm ? 'active' : ''}`}
                onClick={() => setUseWasm(true)}
                title="Chạy local với WebAssembly (nhanh hơn)"
              >
                <FiCpu /> WASM
              </button>
              <button
                className={`mode-btn ${!useWasm ? 'active' : ''}`}
                onClick={() => setUseWasm(false)}
                title="Chạy trên server (hỗ trợ nhiều ngôn ngữ hơn)"
              >
                <FiCloud /> API
              </button>
            </div>
          )}
          <button onClick={clearOutput} className="clear-btn" title="Xóa output">
            Xóa
          </button>
          {onClose && (
            <button onClick={onClose} className="close-btn" title="Đóng terminal">
              <FiX />
            </button>
          )}
        </div>
      </div>
      <div className="runner-output">
        {loading && <div className="loading-text">⏳ Đang biên dịch và chạy code...</div>}
        {error && <pre className="error-output">{error}</pre>}
        {output && !htmlPreview && <pre className="success-output">{output}</pre>}
        
        {/* HTML Preview */}
        {htmlPreview && language === 'html' && (
          <div className={`html-preview-container ${isPreviewExpanded ? 'expanded' : ''}`}>
            <div className="preview-header">
              <span>Preview</span>
              <button 
                className="preview-toggle-btn" 
                onClick={togglePreviewSize}
                title={isPreviewExpanded ? "Thu nhỏ" : "Phóng to"}
              >
                {isPreviewExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
            </div>
            <iframe
              ref={iframeRef}
              className="html-preview"
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
        
        {!loading && !error && !output && !htmlPreview && (
          <div className="empty-output">
            Bấm nút "Run" hoặc Ctrl+Enter để chạy code
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeRunner;
