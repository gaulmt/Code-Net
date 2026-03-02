import { useState, useEffect, useRef } from 'react';
import './InteractiveTerminal.css';

function InteractiveTerminal({ code, language, runTrigger, onClose, projectName, documentId }) {
  const [lines, setLines] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const inputQueueRef = useRef([]);
  const resolveInputRef = useRef(null);

  useEffect(() => {
    if (runTrigger > 0) {
      runCode();
    }
  }, [runTrigger]);

  useEffect(() => {
    // Auto scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    // Focus input when waiting
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  const addLine = (content, type = 'output') => {
    setLines(prev => [...prev, { content, type, id: Date.now() + Math.random() }]);
  };

  const getInput = () => {
    return new Promise((resolve) => {
      setWaitingForInput(true);
      resolveInputRef.current = resolve;
    });
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      const input = currentInput.trim();
      
      // Không cho phép submit rỗng khi đang đợi input
      if (!input && waitingForInput) {
        return; // Phải nhập giá trị mới được tiếp tục
      }
      
      if (waitingForInput) {
        addLine(input, 'input');
        setCurrentInput('');
        setWaitingForInput(false);
        
        if (resolveInputRef.current) {
          resolveInputRef.current(input);
          resolveInputRef.current = null;
        }
      }
    }
  };

  const runCode = async () => {
    setLines([]);
    setIsRunning(true);
    setWaitingForInput(false);

    try {
      if (language === 'javascript') {
        await runJavaScript();
      } else if (language === 'python') {
        await runPython();
      } else if (language === 'c' || language === 'cpp') {
        await runCWithInteractive();
      } else if (language === 'html') {
        await runHTML();
      } else if (language === 'java') {
        await runJava();
      } else {
        addLine(`Ngôn ngữ "${language}" chưa hỗ trợ interactive terminal`, 'error');
      }
    } catch (err) {
      addLine(`Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    } finally {
      setIsRunning(false);
      setWaitingForInput(false);
    }
  };

  const runJavaScript = async () => {
    try {
      // Create custom console
      const customConsole = {
        log: (...args) => {
          const line = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          addLine(line, 'output');
        },
        error: (...args) => {
          addLine(args.join(' '), 'error');
        }
      };

      // Create prompt function for input
      const prompt = async (message) => {
        if (message) addLine(message, 'output');
        const input = await getInput();
        return input;
      };

      // Execute code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction('console', 'prompt', code);
      await fn(customConsole, prompt);
      
      addLine('✓ Program finished', 'success');
    } catch (err) {
      addLine(`JavaScript Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    }
  };

  const runPython = async () => {
    try {
      addLine('⏳ Đang tải Python WebAssembly...', 'info');
      
      // Load Pyodide if not loaded
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Không thể tải Pyodide'));
        });
      }
      
      if (!window.pyodide) {
        addLine('⏳ Khởi tạo Python runtime...', 'info');
        window.pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        });
      }
      
      const pyodide = window.pyodide;
      
      addLine('--- Program Start ---', 'info');
      
      // Check if code has input()
      const hasInput = /input\s*\(/.test(code);
      
      if (hasInput) {
        // Interactive mode - replace input() with custom function
        await pyodide.runPythonAsync(`
import sys
from io import StringIO

# Store outputs
_outputs = []

# Custom print
def custom_print(*args, **kwargs):
    output = ' '.join(str(arg) for arg in args)
    _outputs.append(('output', output))
    
# Custom input
def custom_input(prompt=''):
    if prompt:
        _outputs.append(('output', prompt))
    _outputs.append(('wait_input', ''))
    return ''

# Replace builtins
import builtins
builtins.print = custom_print
builtins.input = custom_input
        `);
        
        // Parse code to find input() calls
        const lines = code.split('\n');
        const variables = {};
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          // Skip empty and comments
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          // Handle print
          const printMatch = trimmed.match(/print\s*\(\s*(.+?)\s*\)/);
          if (printMatch) {
            try {
              let content = printMatch[1];
              
              // Replace variables
              for (const [key, value] of Object.entries(variables)) {
                content = content.replace(new RegExp(`\\b${key}\\b`, 'g'), `"${value}"`);
              }
              
              // Remove quotes if string literal
              content = content.replace(/^["'](.*)["']$/, '$1');
              
              // Handle f-strings
              if (content.includes('{') && content.includes('}')) {
                for (const [key, value] of Object.entries(variables)) {
                  content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
                }
              }
              
              addLine(content, 'output');
            } catch (e) {
              addLine(printMatch[1], 'output');
            }
            continue;
          }
          
          // Handle input
          const inputMatch = trimmed.match(/(\w+)\s*=\s*input\s*\(\s*["']?([^"']*)["']?\s*\)/);
          if (inputMatch) {
            const varName = inputMatch[1];
            const prompt = inputMatch[2];
            
            if (prompt) addLine(prompt, 'output');
            const value = await getInput();
            variables[varName] = value;
            continue;
          }
          
          // Handle simple assignment
          const assignMatch = trimmed.match(/(\w+)\s*=\s*(.+)/);
          if (assignMatch) {
            const varName = assignMatch[1];
            let expr = assignMatch[2].trim();
            
            // Replace variables
            for (const [key, value] of Object.entries(variables)) {
              expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
            }
            
            // Try to evaluate
            try {
              if (/^[\d\s+\-*\/()]+$/.test(expr)) {
                variables[varName] = eval(expr);
              } else {
                variables[varName] = expr.replace(/["']/g, '');
              }
            } catch (e) {
              variables[varName] = expr;
            }
          }
        }
        
        addLine('--- Program End ---', 'success');
        addLine('✓ Program finished', 'success');
        
      } else {
        // No input - run directly with Pyodide
        await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
        `);
        
        await pyodide.runPythonAsync(code);
        
        const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
        const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');
        
        if (stderr) {
          addLine(stderr, 'error');
        } else if (stdout) {
          stdout.split('\n').forEach(line => {
            if (line.trim()) addLine(line, 'output');
          });
        } else {
          addLine('✓ Code chạy thành công (không có output)', 'success');
        }
      }
      
    } catch (err) {
      addLine(`Python Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    }
  };

  const runCWithInteractive = async () => {
    try {
      addLine('⏳ Đang phân tích C/C++ code...', 'info');
      
      // Check for unsupported libraries
      const unsupportedLibs = [];
      if (/#include\s*<windows\.h>/.test(code)) unsupportedLibs.push('windows.h');
      if (/#include\s*<conio\.h>/.test(code)) unsupportedLibs.push('conio.h');
      if (/#include\s*<graphics\.h>/.test(code)) unsupportedLibs.push('graphics.h');
      if (/#include\s*<dos\.h>/.test(code)) unsupportedLibs.push('dos.h');
      
      if (unsupportedLibs.length > 0) {
        addLine(`⚠️ Thư viện không được hỗ trợ: ${unsupportedLibs.join(', ')}`, 'error');
        addLine('Các thư viện này chỉ hoạt động trên Windows/DOS.', 'error');
        addLine('Vui lòng sử dụng thư viện chuẩn C: stdio.h, stdlib.h, string.h, math.h', 'info');
        addLine('', 'output');
        addLine('Thư viện được hỗ trợ:', 'info');
        addLine('✓ stdio.h - printf, scanf, FILE operations', 'output');
        addLine('✓ stdlib.h - malloc, free, rand, atoi', 'output');
        addLine('✓ string.h - strlen, strcpy, strcmp', 'output');
        addLine('✓ math.h - sqrt, pow, sin, cos', 'output');
        addLine('✓ stdbool.h - bool, true, false', 'output');
        addLine('✓ limits.h - INT_MAX, INT_MIN', 'output');
        addLine('✓ time.h - time, clock', 'output');
        return;
      }
      
      // Check if code has scanf - if not, use Wandbox directly
      if (!/scanf|cin/.test(code)) {
        addLine('Code không có input. Sử dụng compiler API...', 'info');
        await runCWithWandbox();
        return;
      }

      addLine('--- Program Start ---', 'info');
      
      // Parse and execute line by line
      const lines = code.split('\n');
      const variables = {}; // Store variable values
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines, comments, includes, declarations
        if (!line || line.startsWith('//') || line.startsWith('#') || 
            line.startsWith('int main') || line === '{' || line === '}' ||
            /^(int|float|double|char)\s+\w+;/.test(line)) {
          continue;
        }
        
        // Handle scanf - CHECK THIS FIRST before printf
        const scanfMatch = line.match(/scanf\s*\(\s*"([^"]*)"\s*,\s*&?(\w+)\s*\)/);
        if (scanfMatch) {
          const varName = scanfMatch[2];
          // DEBUG: Show that we're waiting for input
          addLine(`[Waiting for ${varName}...]`, 'info');
          // WAIT for input - this MUST pause execution
          const input = await getInput();
          // Store the input value
          variables[varName] = input;
          continue;
        }
        
        // Handle printf - AFTER scanf check
        const printfMatch = line.match(/printf\s*\(\s*"([^"]*)"\s*(?:,\s*(.+?))?\s*\)/);
        if (printfMatch) {
          let format = printfMatch[1];
          const args = printfMatch[2];
          
          // Replace format specifiers with actual values
          if (args) {
            const argList = args.split(',').map(a => a.trim());
            let argIndex = 0;
            
            format = format.replace(/%d|%i|%f|%lf|%s|%c/g, (match) => {
              if (argIndex < argList.length) {
                const varName = argList[argIndex].replace(/[&*]/g, '');
                const value = variables[varName] || '?';
                argIndex++;
                return value;
              }
              return match;
            });
          }
          
          // Clean up escape sequences
          format = format
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"');
          
          addLine(format, 'output');
          continue;
        }
        
        // Handle simple assignment
        const assignMatch = line.match(/(\w+)\s*=\s*(.+?);/);
        if (assignMatch) {
          const varName = assignMatch[1];
          let expr = assignMatch[2].trim();
          
          // Try to evaluate expression
          try {
            // Replace variable names with their values
            for (const [key, value] of Object.entries(variables)) {
              expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
            }
            
            // Simple evaluation (only for basic arithmetic)
            if (/^[\d\s+\-*\/()]+$/.test(expr)) {
              variables[varName] = eval(expr);
            } else {
              variables[varName] = expr;
            }
          } catch (e) {
            variables[varName] = expr;
          }
        }
      }
      
      addLine('--- Program End ---', 'success');
      addLine('✓ Simulation complete', 'success');
      
    } catch (err) {
      addLine(`C/C++ Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    }
  };

  const runCWithWandbox = async () => {
    try {
      // Check for unsupported libraries first
      const unsupportedLibs = [];
      if (/#include\s*<windows\.h>/.test(code)) unsupportedLibs.push('windows.h');
      if (/#include\s*<conio\.h>/.test(code)) unsupportedLibs.push('conio.h');
      if (/#include\s*<graphics\.h>/.test(code)) unsupportedLibs.push('graphics.h');
      if (/#include\s*<dos\.h>/.test(code)) unsupportedLibs.push('dos.h');
      
      if (unsupportedLibs.length > 0) {
        addLine(`⚠️ Thư viện không được hỗ trợ: ${unsupportedLibs.join(', ')}`, 'error');
        addLine('Compiler chạy trên Linux, không hỗ trợ thư viện Windows/DOS.', 'error');
        addLine('', 'output');
        addLine('Thay thế gợi ý:', 'info');
        addLine('• windows.h Sleep() → time.h sleep()', 'output');
        addLine('• conio.h getch() → stdio.h getchar()', 'output');
        addLine('• conio.h clrscr() → printf("\\033[2J\\033[H")', 'output');
        return;
      }
      
      addLine('⏳ Compiling with Wandbox API...', 'info');
      
      // Add headers if needed
      let codeWithHeaders = code;
      if (!/#include/.test(code)) {
        const headers = [
          '#include <stdio.h>',
          '#include <stdlib.h>',
          '#include <string.h>',
          '#include <math.h>',
          '#include <stdbool.h>',
          '#include <limits.h>',
          '#include <time.h>'
        ];
        codeWithHeaders = headers.join('\n') + '\n\n' + code;
      }
      
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'gcc-head',
          code: codeWithHeaders,
          options: '-std=c11 -O2 -Wall -lm',
          stdin: inputQueueRef.current.join('\n'),
        })
      });

      const result = await response.json();
      
      if (result.program_output) {
        result.program_output.split('\n').forEach(line => {
          if (line.trim()) addLine(line, 'output');
        });
      } else if (result.program_message) {
        result.program_message.split('\n').forEach(line => {
          if (line.trim()) addLine(line, 'output');
        });
      } else if (result.compiler_error) {
        addLine(result.compiler_error, 'error');
      } else {
        addLine('✓ Code chạy thành công (không có output)', 'success');
      }
    } catch (err) {
      addLine(`Compilation Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    }
  };

  const runHTML = async () => {
    try {
      if (!documentId) {
        addLine('⚠️ Không tìm thấy documentId', 'error');
        return;
      }
      
      addLine('⏳ Đang thu thập files HTML/CSS/JS...', 'info');
      
      // Dynamic import to avoid circular dependency
      const { getFiles } = await import('../socket');
      
      getFiles(documentId, (filesList) => {
        const htmlFiles = filesList.filter(f => f.name.endsWith('.html'));
        const cssFiles = filesList.filter(f => f.name.endsWith('.css'));
        const jsFiles = filesList.filter(f => f.name.endsWith('.js'));
        
        // Build complete HTML
        let fullHTML = code;
        
        // Inject CSS
        if (cssFiles.length > 0) {
          addLine(`✓ Tìm thấy ${cssFiles.length} file CSS`, 'info');
          // Extract text from content object
          const cssContent = cssFiles
            .map(f => {
              if (f.content && typeof f.content === 'object' && f.content.text) {
                return f.content.text;
              }
              return f.content || '';
            })
            .join('\n');
          
          const cssTag = `<style>\n${cssContent}\n</style>`;
          
          if (fullHTML.includes('</head>')) {
            fullHTML = fullHTML.replace('</head>', `${cssTag}\n</head>`);
          } else if (fullHTML.includes('<head>')) {
            fullHTML = fullHTML.replace('<head>', `<head>\n${cssTag}`);
          } else {
            fullHTML = `<head>\n${cssTag}\n</head>\n${fullHTML}`;
          }
        }
        
        // Inject JS
        if (jsFiles.length > 0) {
          addLine(`✓ Tìm thấy ${jsFiles.length} file JS`, 'info');
          // Extract text from content object
          const jsContent = jsFiles
            .map(f => {
              if (f.content && typeof f.content === 'object' && f.content.text) {
                return f.content.text;
              }
              return f.content || '';
            })
            .join('\n');
          
          const jsTag = `<script>\n${jsContent}\n</script>`;
          
          if (fullHTML.includes('</body>')) {
            fullHTML = fullHTML.replace('</body>', `${jsTag}\n</body>`);
          } else {
            fullHTML = `${fullHTML}\n${jsTag}`;
          }
        }
        
        // Open in new tab
        const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        
        if (newWindow) {
          addLine('✓ Đã mở preview trong tab mới!', 'success');
          addLine('Đóng tab để dừng preview', 'info');
          
          // Clean up URL after 5 minutes
          setTimeout(() => URL.revokeObjectURL(url), 300000);
        } else {
          addLine('⚠️ Trình duyệt chặn popup!', 'error');
          addLine('Vui lòng cho phép popup cho trang này', 'info');
        }
      });
      
    } catch (err) {
      addLine(`HTML Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    }
  };

  const runJava = async () => {
    try {
      addLine('⏳ Compiling Java with Wandbox API...', 'info');
      
      // Add imports if needed
      let codeWithImports = code;
      if (!/import\s+java/.test(code) && !code.includes('package ')) {
        const imports = [
          'import java.util.*;',
          'import java.io.*;',
          'import java.math.*;'
        ];
        codeWithImports = imports.join('\n') + '\n\n' + code;
      }
      
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'openjdk-head',
          code: codeWithImports,
          stdin: inputQueueRef.current.join('\n'),
        })
      });

      const result = await response.json();
      
      if (result.program_output) {
        result.program_output.split('\n').forEach(line => {
          if (line.trim()) addLine(line, 'output');
        });
      } else if (result.program_message) {
        result.program_message.split('\n').forEach(line => {
          if (line.trim()) addLine(line, 'output');
        });
      } else if (result.compiler_error) {
        addLine(result.compiler_error, 'error');
      } else {
        addLine('✓ Code chạy thành công (không có output)', 'success');
      }
    } catch (err) {
      addLine(`Java Error: ${err.message}`, 'error');
      addLine('', 'output');
      addLine('Vui lòng liên hệ Admin nếu cần hỗ trợ', 'info');
    }
  };

  const clearTerminal = () => {
    setLines([]);
    setCurrentInput('');
    setWaitingForInput(false);
    inputQueueRef.current = [];
  };

  return (
    <div className="interactive-terminal">
      <div className="terminal-header">
        <div className="terminal-title">
          <h4>Interactive Terminal</h4>
          {projectName && <span className="project-name">{projectName}</span>}
        </div>
        <div className="terminal-actions">
          <button onClick={clearTerminal} className="clear-btn">Clear</button>
          {onClose && <button onClick={onClose} className="close-btn">✕</button>}
        </div>
      </div>
      
      <div className="terminal-body" ref={terminalRef}>
        {lines.map(line => (
          <div key={line.id} className={`terminal-line ${line.type}`}>
            {line.type === 'input' && <span className="prompt">{'> '}</span>}
            <span className="content">
              {line.content}
              {line.type === 'info' && line.content === 'Vui lòng liên hệ Admin nếu cần hỗ trợ' && (
                <>
                  {' - '}
                  <a 
                    href="https://www.facebook.com/share/18Fa25fAke/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="admin-link"
                  >
                    Liên hệ Admin
                  </a>
                </>
              )}
            </span>
          </div>
        ))}
        
        {waitingForInput && (
          <div className="terminal-line input-line">
            <span className="prompt">{'> '}</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleInputSubmit}
              className="terminal-input"
              placeholder="Nhập giá trị và Enter..."
              autoFocus
            />
          </div>
        )}
        
        {isRunning && !waitingForInput && (
          <div className="terminal-line info">
            <span className="loading-cursor">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveTerminal;
