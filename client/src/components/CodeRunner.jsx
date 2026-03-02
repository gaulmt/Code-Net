import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import './CodeRunner.css';

function CodeRunner({ code, language, runTrigger, onClose }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stdin, setStdin] = useState('');
  const [terminalLines, setTerminalLines] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputCallback, setInputCallback] = useState(null);
  const pyodideRef = useRef(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const iframeRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (runTrigger > 0) {
      runCode();
    }
  }, [runTrigger, code]); // Add code dependency

  const runCode = async () => {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      if (language === 'javascript') {
        await runJavaScript();
      } else if (language === 'python') {
        await runPython();
      } else if (language === 'html') {
        await runHTML();
      } else if (language === 'cpp' || language === 'c') {
        await runCppWithWandbox();
      } else if (language === 'java') {
        await runJavaWithWandbox();
      } else {
        setError(`Ngôn ngữ "${language}" chưa được hỗ trợ. Hiện tại hỗ trợ: JavaScript, Python, HTML, C++, C, Java.`);
      }
    } catch (err) {
      console.error('Run error:', err);
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runJavaScript = async () => {
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

  const runHTML = async () => {
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
      throw new Error('Không thể tải Python WebAssembly');
    }
  };

  const runPython = async () => {
    try {
      setOutput('⏳ Đang tải Python WebAssembly lần đầu (có thể mất vài giây)...');

      const pyodide = await loadPyodide();

      setOutput('⏳ Đang chạy code Python...');

      // Redirect stdout and setup stdin
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
${stdin ? `sys.stdin = StringIO("""${stdin.replace(/"/g, '\\"')}""")` : ''}
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
      setError(`Python Error: ${err.message}`);
    }
  };

  const runCppWithWandbox = async () => {
    try {
      setOutput('⏳ Đang biên dịch và chạy C/C++ code...');

      // Add common headers if not present
      let codeWithHeaders = code;
      const commonHeaders = [
        '#include <stdio.h>',
        '#include <stdlib.h>',
        '#include <string.h>',
        '#include <math.h>',
        '#include <stdbool.h>',
        '#include <limits.h>',
        '#include <time.h>'
      ];

      // Check if code already has includes
      const hasIncludes = /#include/.test(code);
      if (!hasIncludes) {
        codeWithHeaders = commonHeaders.join('\n') + '\n\n' + code;
      }

      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compiler: language === 'c' ? 'gcc-head' : 'gcc-head',
          code: codeWithHeaders,
          options: language === 'c' ? '-std=c11 -O2 -Wall -lm' : '-std=c++17 -O2 -Wall -lm',
          stdin: stdin || '',
          'compiler-option-raw': '',
          'runtime-option-raw': ''
        })
      });

      const result = await response.json();

      console.log('Wandbox result:', result); // Debug

      // Priority: program_output > program_message
      if (result.status !== '0' && result.compiler_error) {
        setError(`Compilation Error:\n${result.compiler_error}`);
      } else if (result.program_error) {
        setError(`Runtime Error:\n${result.program_error}`);
      } else if (result.program_output) {
        setOutput(result.program_output);
      } else if (result.program_message) {
        setOutput(result.program_message);
      } else {
        setOutput('✓ Code chạy thành công (không có output)');
      }
    } catch (err) {
      setError(`${language === 'c' ? 'C' : 'C++'} Error: ${err.message}\n\nLưu ý: Cần kết nối internet để sử dụng compiler API.`);
    }
  };

  const runJavaWithWandbox = async () => {
    try {
      setOutput('⏳ Đang biên dịch và chạy Java code...');

      // Add common imports if not present
      let codeWithImports = code;
      const commonImports = [
        'import java.util.*;',
        'import java.io.*;',
        'import java.math.*;'
      ];

      // Check if code already has imports
      const hasImports = /import\s+java/.test(code);
      if (!hasImports && !code.includes('package ')) {
        codeWithImports = commonImports.join('\n') + '\n\n' + code;
      }

      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compiler: 'openjdk-head',
          code: codeWithImports,
          stdin: stdin || '',
          'compiler-option-raw': '',
          'runtime-option-raw': ''
        })
      });

      const result = await response.json();

      console.log('Wandbox Java result:', result); // Debug

      // Priority: program_output > program_message
      if (result.status !== '0' && result.compiler_error) {
        setError(`Compilation Error:\n${result.compiler_error}`);
      } else if (result.program_error) {
        setError(`Runtime Error:\n${result.program_error}`);
      } else if (result.program_output) {
        setOutput(result.program_output);
      } else if (result.program_message) {
        setOutput(result.program_message);
      } else {
        setOutput('✓ Code chạy thành công (không có output)');
      }
    } catch (err) {
      setError(`Java Error: ${err.message}\n\nLưu ý: Cần kết nối internet để sử dụng compiler API.`);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      // Add input to terminal
      setTerminalLines(prev => [...prev, { type: 'input', content: currentInput }]);
      
      // Add to stdin for next run
      setStdin(prev => prev ? prev + '\n' + currentInput : currentInput);
      
      // Clear input
      setCurrentInput('');
      
      // If waiting for callback, trigger it
      if (inputCallback) {
        inputCallback(currentInput);
        setInputCallback(null);
        setWaitingForInput(false);
      }
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
    setHtmlPreview('');
    setTerminalLines([]);
    setCurrentInput('');
    setStdin('');
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

      {/* Input field for stdin - Terminal style */}
      {(language === 'c' || language === 'cpp' || language === 'java' || language === 'python') && (
        <div className="terminal-input-line">
          <span className="terminal-prompt">$</span>
          <input
            type="text"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Nhập input (cách nhau bởi space hoặc enter): 5 10"
            className="terminal-input-inline"
          />
        </div>
      )}

      <div className="runner-output">
        {loading && (
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <span className="loading-text">⏳ Đang biên dịch và chạy code...</span>
          </div>
        )}
        {error && (
          <div className="terminal-line">
            <span className="terminal-prompt error">✗</span>
            <pre className="error-output">{error}</pre>
          </div>
        )}
        {output && !htmlPreview && (
          <div className="terminal-line">
            <span className="terminal-prompt success">✓</span>
            <pre className="success-output">{output}</pre>
          </div>
        )}

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
          <div className="terminal-line empty">
            <span className="terminal-prompt">$</span>
            <span className="empty-output">Bấm Run hoặc Ctrl+Enter để chạy code</span>
          </div>
        )}
      </div>
    </div>
  );
}


export default CodeRunner;
