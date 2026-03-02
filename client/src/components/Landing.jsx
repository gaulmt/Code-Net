import { useState, useEffect, useRef } from 'react';
import { FiCode, FiUsers, FiZap, FiGlobe, FiArrowRight, FiCopy, FiCheck, FiLogIn, FiUserPlus, FiFolder } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import ParticleText from './ParticleText';
import ProjectsManager from './ProjectsManager';
import './Landing.css';

function Landing({ onCreateProject, onJoinProject, onLogin, onSignup, onGoogleSignIn, onLogout, authUser, userProfile, onUsernameSet, onOpenProfile, authLoading }) {
  const [view, setView] = useState('home'); // home, login, signup, create, join, projectCode, setUsername
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [showProjects, setShowProjects] = useState(false);

  // Expose openProfile to window for avatar click
  useEffect(() => {
    if (onOpenProfile) {
      window.openProfile = onOpenProfile;
    }
    return () => {
      delete window.openProfile;
    };
  }, [onOpenProfile]);

  // Auto redirect to home after login
  useEffect(() => {
    if (authUser && userProfile && (view === 'login' || view === 'signup' || view === 'setUsername')) {
      console.log('Auto redirecting to home, current view:', view);
      setView('home');
    }
  }, [authUser, userProfile, view]);

  // Scroll to top when view changes to home
  useEffect(() => {
    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  // Debug view changes
  useEffect(() => {
    console.log('Current view:', view, 'Auth:', !!authUser, 'Profile:', !!userProfile);
    
    // Debug: Check if feature showcases exist in DOM
    if (view === 'home') {
      setTimeout(() => {
        const showcases = document.querySelectorAll('.feature-showcase');
        console.log('Feature showcases in DOM:', showcases.length);
        showcases.forEach((s, i) => {
          const rect = s.getBoundingClientRect();
          const styles = window.getComputedStyle(s);
          console.log(`Showcase ${i}:`, {
            opacity: styles.opacity,
            transform: styles.transform,
            display: styles.display,
            visibility: styles.visibility,
            top: rect.top,
            height: rect.height
          });
        });
      }, 500);
    }
  }, [view, authUser, userProfile]);

  // Ensure home view on mount if logged in
  useEffect(() => {
    if (authUser && userProfile && view !== 'home') {
      console.log('Setting view to home on mount');
      setView('home');
    }
  }, [authUser, userProfile]);


  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      onLogin(email, password);
      // Chuyển về home sau khi đăng nhập
      setTimeout(() => setView('home'), 500);
    }
  };

  const handleSignup = () => {
    if (username.trim() && email.trim() && password.trim()) {
      onSignup(username, email, password);
      // Chuyển về home sau khi đăng ký
      setTimeout(() => setView('home'), 500);
    }
  };

  const handleCreate = () => {
    // If user has profile, use username from profile
    if (userProfile) {
      const projectName = projectCode.trim() || 'Untitled Project';
      const code = `ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setGeneratedCode(code);
      setView('projectCode');
      // Store project name for later use
      window.tempProjectName = projectName;
    } else {
      // Guest user - need username
      if (username.trim()) {
        const code = `ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        setGeneratedCode(code);
        setView('projectCode');
      }
    }
  };

  const handleStartProject = () => {
    const displayName = userProfile ? userProfile.username : username;
    const projectName = window.tempProjectName || generatedCode;
    onCreateProject(displayName, generatedCode, projectName);
    delete window.tempProjectName;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    const displayName = userProfile ? userProfile.username : username.trim();
    if (displayName && projectCode.trim()) {
      onJoinProject(displayName, projectCode.trim());
    }
  };

  const handleSetUsername = async () => {
    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên người dùng');
      return;
    }
    
    if (username.length < 3) {
      setUsernameError('Tên người dùng phải có ít nhất 3 ký tự');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới');
      return;
    }
    
    await onUsernameSet(username.trim());
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav">
              <img src="/logo.jpg" alt="Code Net Logo" className="logo-image" />
              <span className="logo-text">
                <span className="logo-code">Code</span>
                <span className="logo-net">Net</span>
              </span>
            </div>
            <div className="nav-actions">
              <div className="nav-skeleton">
                <div className="skeleton-btn"></div>
                <div className="skeleton-avatar"></div>
              </div>
            </div>
          </div>
        </nav>
        <div className="hero-section">
          <div className="hero-content">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show username setup if logged in but no profile
  if (authUser && !userProfile) {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav" onClick={() => setView('home')}>
              <img src="/logo.jpg" alt="Code Net Logo" className="logo-image" />
              <span className="logo-text">
                <span className="logo-code">Code</span>
                <span className="logo-net">Net</span>
              </span>
            </div>
          </div>
        </nav>

        <div className="modal-container">
          <div className="modal-box">
            <h2>Chào mừng!</h2>
            <p>Vui lòng chọn tên người dùng của bạn</p>
            <input
              type="text"
              placeholder="Tên người dùng (VD: john_doe)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
              autoFocus
            />
            {usernameError && <p className="error-text">{usernameError}</p>}
            <p className="hint-text">
              • Tên người dùng là duy nhất trên hệ thống<br/>
              • Chỉ chứa chữ cái, số và dấu gạch dưới<br/>
              • Tối thiểu 3 ký tự
            </p>
            <div className="modal-actions">
              <button className="btn-primary full-width" onClick={handleSetUsername}>
                Tiếp tục <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Project Code View
  if (view === 'projectCode') {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav">Code Net</div>
            <div className="nav-actions">
              <button className="btn-nav" onClick={() => {
                setView('home');
                setGeneratedCode('');
                setUsername('');
              }}>
                Trang chủ
              </button>
            </div>
          </div>
        </nav>

        <div className="modal-container">
          <div className="modal-box">
            <div className="success-icon">✓</div>
            <h2>Project Đã Tạo!</h2>
            <p>Chia sẻ mã này với team của bạn</p>
            
            <div className="project-code-display">
              <code>{generatedCode}</code>
              <button className="copy-btn" onClick={handleCopyCode}>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            <div className="modal-actions">
              <button className="btn-primary full-width" onClick={handleStartProject}>
                Bắt Đầu Code <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login View
  if (view === 'login') {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav">Code Net</div>
            <div className="nav-actions">
              <button className="btn-nav" onClick={() => setView('home')}>
                Trang chủ
              </button>
              <button className="btn-nav-primary" onClick={() => setView('signup')}>
                <FiUserPlus /> Đăng ký
              </button>
            </div>
          </div>
        </nav>

        <div className="modal-container">
          <div className="modal-box">
            <h2>Đăng Nhập</h2>
            <p>Đăng nhập để quản lý dự án của bạn</p>
            <input
              type="email"
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setView('home')}>
                Quay lại
              </button>
              <button className="btn-primary" onClick={handleLogin}>
                Đăng nhập <FiArrowRight />
              </button>
            </div>
            
            <div className="divider">
              <span>hoặc</span>
            </div>
            
            <button className="btn-google" onClick={onGoogleSignIn}>
              <FcGoogle size={20} /> Đăng nhập với Google
            </button>
            
            <p className="switch-auth">
              Chưa có tài khoản? <span onClick={() => setView('signup')}>Đăng ký ngay</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Signup View
  if (view === 'signup') {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav">Code Net</div>
            <div className="nav-actions">
              <button className="btn-nav" onClick={() => setView('home')}>
                Trang chủ
              </button>
              <button className="btn-nav-primary" onClick={() => setView('login')}>
                <FiLogIn /> Đăng nhập
              </button>
            </div>
          </div>
        </nav>

        <div className="modal-container">
          <div className="modal-box">
            <h2>Đăng Ký</h2>
            <p>Tạo tài khoản để bắt đầu</p>
            <input
              type="text"
              placeholder="Tên của bạn..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <input
              type="email"
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setView('home')}>
                Quay lại
              </button>
              <button className="btn-primary" onClick={handleSignup}>
                Đăng ký <FiArrowRight />
              </button>
            </div>
            
            <div className="divider">
              <span>hoặc</span>
            </div>
            
            <button className="btn-google" onClick={onGoogleSignIn}>
              <FcGoogle size={20} /> Đăng ký với Google
            </button>
            
            <p className="switch-auth">
              Đã có tài khoản? <span onClick={() => setView('login')}>Đăng nhập</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Create Project View
  if (view === 'create') {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav">Code Net</div>
            <div className="nav-actions">
              <button className="btn-nav" onClick={() => setView('home')}>
                Trang chủ
              </button>
              <button className="btn-nav" onClick={() => setView('join')}>
                <FiUsers /> Tham gia Project
              </button>
            </div>
          </div>
        </nav>

        <div className="modal-container">
          <div className="modal-box">
            <h2>Tạo Project Mới</h2>
            {userProfile ? (
              <>
                <p>Nhập tên project của bạn</p>
                <input
                  type="text"
                  placeholder="Tên project (VD: My Awesome App)"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </>
            ) : (
              <>
                <p>Nhập tên của bạn để bắt đầu</p>
                <input
                  type="text"
                  placeholder="Tên của bạn..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setView('home')}>
                Quay lại
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                Tạo Project <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join Project View
  if (view === 'join') {
    return (
      <div className="landing">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-nav">Code Net</div>
            <div className="nav-actions">
              <button className="btn-nav" onClick={() => setView('home')}>
                Trang chủ
              </button>
              <button className="btn-nav" onClick={() => setView('create')}>
                <FiCode /> Tạo Project
              </button>
            </div>
          </div>
        </nav>

        <div className="modal-container">
          <div className="modal-box">
            <h2>Tham Gia Project</h2>
            <p>Nhập mã project để tham gia</p>
            {!userProfile && (
              <input
                type="text"
                placeholder="Tên của bạn..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-1"
              />
            )}
            <input
              type="text"
              placeholder="Mã room (VD: ROOM_ABC123)"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus={!!userProfile}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setView('home')}>
                Quay lại
              </button>
              <button className="btn-primary" onClick={handleJoin}>
                Tham Gia <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home View
  return (
    <div className="landing">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-nav" onClick={() => setView('home')}>
            <img src="/logo.jpg" alt="Code Net Logo" className="logo-image" />
            <span className="logo-text">
              <span className="logo-code">Code</span>
              <span className="logo-net">Net</span>
            </span>
          </div>
          <div className="nav-actions">
            {authLoading ? (
              <div className="nav-skeleton">
                <div className="skeleton-btn"></div>
                <div className="skeleton-avatar"></div>
              </div>
            ) : authUser && userProfile ? (
              <div className="user-menu">
                <button className="btn-nav" onClick={() => setShowProjects(true)}>
                  <FiFolder /> Projects
                </button>
                <div className="user-avatar-nav" title="Profile" onClick={() => window.openProfile && window.openProfile()}>
                  <img src={userProfile.photoURL} alt={userProfile.username} />
                  <span>
                    {userProfile.username}
                    {userProfile.username === 'gaulmt' && (
                      <svg className="verified-badge" viewBox="0 0 24 24" aria-label="Verified">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="currentColor"/>
                      </svg>
                    )}
                  </span>
                </div>
                <button className="btn-nav btn-logout" onClick={() => {
                  if (window.confirm('Bạn có muốn đăng xuất?')) {
                    onLogout();
                  }
                }}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button className="btn-nav" onClick={() => setView('login')}>
                  <FiLogIn /> Đăng nhập
                </button>
                <button className="btn-nav-primary" onClick={() => setView('signup')}>
                  <FiUserPlus /> Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-title">
            <ParticleText onClick={() => setView('home')} />
          </div>
          <p className="hero-subtitle">
            Nền tảng code cộng tác real-time với quản lý team chuyên nghiệp
          </p>
          
          <div className="cta-buttons">
            <button className="btn-primary large" onClick={() => setView('create')}>
              <FiCode /> Tạo Project Mới
            </button>
            <button className="btn-secondary large" onClick={() => setView('join')}>
              <FiUsers /> Tham Gia Project
            </button>
          </div>
          
          <button 
            className="scroll-hint" 
            onClick={() => {
              const featuresSection = document.querySelector('.features-section');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            aria-label="Scroll to features"
          >
            <span>Khám phá tính năng</span>
            <FiArrowRight style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Tính năng nổi bật</h2>
        <p className="section-subtitle">Khám phá những công cụ mạnh mẽ giúp team code hiệu quả hơn</p>
      </div>

      {/* Feature 1: Real-time Collaboration */}
      <div className="feature-showcase">
        <div className="feature-showcase-content">
          <div className="feature-text">
            <div className="feature-badge">Real-time</div>
            <h2>Cộng tác thời gian thực</h2>
            <p className="feature-description">
              Viết code cùng nhau như Google Docs. Thấy cursor, selections và thay đổi của mọi người ngay lập tức. 
              Không cần refresh, không lag, mọi thứ đồng bộ hoàn hảo qua Firebase Realtime Database.
            </p>
            <ul className="feature-list">
              <li><FiCheck className="check-icon" /> Đồng bộ code tức thì</li>
              <li><FiCheck className="check-icon" /> Hiển thị cursor của team members</li>
              <li><FiCheck className="check-icon" /> Chat real-time tích hợp</li>
              <li><FiCheck className="check-icon" /> Không giới hạn số người tham gia</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="mockup-window">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="mockup-title">editor.jsx</div>
              </div>
              <div className="mockup-content">
                <div className="code-line">
                  <span className="line-number">1</span>
                  <span className="code-text"><span className="keyword">function</span> <span className="function">App</span>() {'{'}</span>
                </div>
                <div className="code-line">
                  <span className="line-number">2</span>
                  <span className="code-text">  <span className="keyword">const</span> [users, setUsers] = <span className="function">useState</span>([]);</span>
                  <span className="cursor cursor-1" title="User 1"></span>
                </div>
                <div className="code-line">
                  <span className="line-number">3</span>
                  <span className="code-text">  <span className="keyword">return</span> (</span>
                </div>
                <div className="code-line">
                  <span className="line-number">4</span>
                  <span className="code-text">    {'<'}<span className="tag">Editor</span> <span className="attr">realtime</span>={'{'}true{'}'} /{'>'}</span>
                  <span className="cursor cursor-2" title="User 2"></span>
                </div>
                <div className="code-line">
                  <span className="line-number">5</span>
                  <span className="code-text">  );</span>
                </div>
                <div className="code-line">
                  <span className="line-number">6</span>
                  <span className="code-text">{'}'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Multi-language Support */}
      <div className="feature-showcase feature-showcase-reverse">
        <div className="feature-showcase-content">
          <div className="feature-visual">
            <div className="mockup-window">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="mockup-title">Languages</div>
              </div>
              <div className="mockup-content language-grid">
                <div className="language-item">
                  <img src="/js_logo.png" alt="JavaScript" className="language-logo" />
                  <span>JavaScript</span>
                </div>
                <div className="language-item">
                  <img src="/py_logo.png" alt="Python" className="language-logo" />
                  <span>Python</span>
                </div>
                <div className="language-item">
                  <img src="/ts_logo.png" alt="TypeScript" className="language-logo" />
                  <span>TypeScript</span>
                </div>
                <div className="language-item">
                  <img src="/c_logo.png" alt="C++" className="language-logo" />
                  <span>C++</span>
                </div>
                <div className="language-item">
                  <img src="/java_logo.png" alt="Java" className="language-logo" />
                  <span>Java</span>
                </div>
                <div className="language-item">
                  <img src="/css.png" alt="HTML/CSS" className="language-logo" />
                  <span>HTML/CSS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="feature-text">
            <div className="feature-badge">Multi-language</div>
            <h2>Hỗ trợ đa ngôn ngữ</h2>
            <p className="feature-description">
              Monaco Editor - trình soạn thảo code của VS Code, hỗ trợ syntax highlighting, 
              autocomplete và IntelliSense cho hơn 50+ ngôn ngữ lập trình. Biên dịch và chạy code 
              trực tiếp trên browser.
            </p>
            <ul className="feature-list">
              <li><FiCheck className="check-icon" /> Syntax highlighting thông minh</li>
              <li><FiCheck className="check-icon" /> Auto-complete và IntelliSense</li>
              <li><FiCheck className="check-icon" /> Biên dịch online với EMKC Piston</li>
              <li><FiCheck className="check-icon" /> Terminal tích hợp xem output</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feature 3: Team Management */}
      <div className="feature-showcase">
        <div className="feature-showcase-content">
          <div className="feature-text">
            <div className="feature-badge">Team Management</div>
            <h2>Quản lý team chuyên nghiệp</h2>
            <p className="feature-description">
              Hệ thống phân quyền chi tiết với 5 vai trò: Leader, Developer, Designer, Member, Viewer. 
              Leader có thể phân quyền read/write cho từng thành viên, thậm chí chuyển quyền leader cho người khác.
            </p>
            <ul className="feature-list">
              <li><FiCheck className="check-icon" /> 5 vai trò với quyền hạn khác nhau</li>
              <li><FiCheck className="check-icon" /> Phân quyền Read/Write chi tiết</li>
              <li><FiCheck className="check-icon" /> Chuyển quyền Leader linh hoạt</li>
              <li><FiCheck className="check-icon" /> Quản lý thành viên real-time</li>
            </ul>
          </div>
          <div className="feature-visual">
            <div className="mockup-window">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="mockup-title">Team Members</div>
              </div>
              <div className="mockup-content team-list">
                <div className="team-member">
                  <a href="https://www.facebook.com/share/18Fa25fAke/" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1}}>
                    <img src="/admin.jpg" alt="gaulmt" className="member-avatar-img" />
                    <div className="member-info">
                      <div className="member-name">
                        gaulmt
                        <svg className="verified-badge-mini" viewBox="0 0 24 24" aria-label="Verified">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="member-role">Admin</div>
                    </div>
                  </a>
                  <div className="member-badges">
                    <span className="badge-mini badge-r">R</span>
                    <span className="badge-mini badge-w">W</span>
                    <span className="badge-mini badge-m">M</span>
                  </div>
                </div>
                <div className="team-member">
                  <img src="/bill.png" alt="Bill Gates" className="member-avatar-img" style={{borderColor: '#4ECDC4'}} />
                  <div className="member-info">
                    <div className="member-name">
                      Bill Gates 💻
                      <span className="ceo-badge">CEO Microsoft</span>
                    </div>
                    <div className="member-role">Developer</div>
                  </div>
                  <div className="member-badges">
                    <span className="badge-mini badge-r">R</span>
                    <span className="badge-mini badge-w">W</span>
                  </div>
                </div>
                <div className="team-member">
                  <img src="/mark.png" alt="Mark Zuckerberg" className="member-avatar-img" style={{borderColor: '#FF6B6B'}} />
                  <div className="member-info">
                    <div className="member-name">
                      Mark Zuckerberg 🎨
                      <span className="ceo-badge">CEO Facebook</span>
                    </div>
                    <div className="member-role">Designer</div>
                  </div>
                  <div className="member-badges">
                    <span className="badge-mini badge-r">R</span>
                    <span className="badge-mini badge-w">W</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: Cloud-based */}
      <div className="feature-showcase feature-showcase-reverse">
        <div className="feature-showcase-content">
          <div className="feature-visual">
            <div className="mockup-window">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="mockup-title">Firebase Realtime DB</div>
              </div>
              <div className="mockup-content cloud-visual">
                <div className="cloud-icon">☁️</div>
                <div className="cloud-stats">
                  <div className="stat-item">
                    <div className="stat-value">&lt; 50ms</div>
                    <div className="stat-label">Latency</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">99.9%</div>
                    <div className="stat-label">Uptime</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">∞</div>
                    <div className="stat-label">Storage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="feature-text">
            <div className="feature-badge">Cloud-based</div>
            <h2>Lưu trữ đám mây</h2>
            <p className="feature-description">
              Tất cả code và dữ liệu được lưu trên Firebase Realtime Database. Không cần cài đặt, 
              không lo mất dữ liệu, truy cập từ bất kỳ đâu với internet. Tự động backup và sync.
            </p>
            <ul className="feature-list">
              <li><FiCheck className="check-icon" /> Không cần cài đặt, chạy trên browser</li>
              <li><FiCheck className="check-icon" /> Tự động lưu và backup</li>
              <li><FiCheck className="check-icon" /> Truy cập từ mọi thiết bị</li>
              <li><FiCheck className="check-icon" /> Bảo mật với Firebase Authentication</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2 className="section-title">Cách sử dụng</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Tạo hoặc tham gia project</h3>
            <p>Tạo project mới hoặc nhập mã room để tham gia</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Mời team của bạn</h3>
            <p>Chia sẻ mã room với các thành viên</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Code cùng nhau</h3>
            <p>Viết code, chat, và quản lý file real-time</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.jpg" alt="Code Net" />
              <span>Code Net</span>
            </div>
            <p className="footer-tagline">Nền tảng code cộng tác real-time</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>Sản phẩm</h4>
              <ul>
                <li><a href="#features">Tính năng</a></li>
                <li><a href="#team">Quản lý team</a></li>
                <li><a href="#languages">Ngôn ngữ</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><a href="#docs">Tài liệu</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#contact">Liên hệ</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Tác giả</h4>
              <ul>
                <li>
                  <a href="https://www.facebook.com/share/18Fa25fAke/" target="_blank" rel="noopener noreferrer">
                    <FiGlobe /> Nguyễn Đăng Dương
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/share/18Fa25fAke/" target="_blank" rel="noopener noreferrer">
                    <FiCode /> Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 Code Net. Dự án của <a href="https://www.facebook.com/share/18Fa25fAke/" target="_blank" rel="noopener noreferrer">Nguyễn Đăng Dương</a></p>
        </div>
      </footer>

      {/* Projects Manager Modal */}
      {showProjects && authUser && (
        <ProjectsManager
          userId={authUser.uid}
          onClose={() => setShowProjects(false)}
          onJoinProject={(code, savedRole, projectName) => {
            setShowProjects(false);
            const displayName = userProfile ? userProfile.username : 'Guest';
            // Skip check when opening saved project, pass project name
            onJoinProject(displayName, code, savedRole, true, projectName);
          }}
        />
      )}
    </div>
  );
}

export default Landing;
