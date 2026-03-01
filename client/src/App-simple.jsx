import { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState('landing');
  const [username, setUsername] = useState('');
  const [projectCode, setProjectCode] = useState('');

  if (step === 'landing') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Code Together</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Collaborative Code Editor - Real-time
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setStep('create')}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Tạo Project
            </button>
            <button 
              onClick={() => setStep('join')}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Tham Gia
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          maxWidth: '450px',
          width: '100%'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Tạo Project</h2>
          <input
            type="text"
            placeholder="Tên của bạn..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setStep('landing')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#e0e0e0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Quay lại
            </button>
            <button 
              onClick={() => {
                if (username.trim()) {
                  const code = `PROJECT_${Date.now().toString(36).toUpperCase()}`;
                  setProjectCode(code);
                  setStep('editor');
                }
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Tạo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'editor') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1e1e1e',
        color: 'white',
        padding: '20px'
      }}>
        <h1>Editor Mode</h1>
        <p>User: {username}</p>
        <p>Project: {projectCode}</p>
        <p>✅ Đã vào được editor!</p>
        <button 
          onClick={() => {
            setStep('landing');
            setUsername('');
            setProjectCode('');
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  return null;
}

export default App;
