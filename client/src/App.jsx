import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import UserPanel from './components/UserPanel';
import FileManager from './components/FileManager';
import Landing from './components/Landing';
import Profile from './components/Profile';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import NotificationBell from './components/NotificationBell';
import { joinDocument } from './socket';
import { 
  auth, 
  signInUser, 
  signUpUser, 
  signOutUser, 
  signInWithGoogle, 
  saveUserProject, 
  updateProjectAccess,
  checkUsernameAvailable,
  saveUserProfile,
  getUserProfile,
  updateUserAvatar,
  checkProjectExists,
  createProjectMetadata,
  updateProjectActivity,
  saveProjectMember,
  getUserRoleInProject,
  sendOTPEmail,
  verifyOTP,
  resendOTP
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [currentFile, setCurrentFile] = useState('main.js');
  const [showLanding, setShowLanding] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userPanelWidth, setUserPanelWidth] = useState(240);
  const [fileManagerWidth, setFileManagerWidth] = useState(250);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'dark');
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        // Try to load user profile, but don't fail if permission denied
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.log('Could not load profile (may not exist yet):', error.message);
          setUserProfile(null);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Restore project state on reload
  useEffect(() => {
    if (authUser && userProfile && !documentId) {
      const savedProjectId = localStorage.getItem('currentProjectId');
      const savedProjectName = localStorage.getItem('currentProjectName');
      const savedUserData = localStorage.getItem('currentUserData');
      
      if (savedProjectId && savedUserData) {
        console.log('🔄 Restoring project state...', { savedProjectId, savedProjectName });
        try {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
          setDocumentId(savedProjectId);
          setProjectName(savedProjectName || savedProjectId);
          setShowLanding(false);
          
          // Rejoin the project
          joinDocument(savedProjectId, userData, {
            onUsersUpdate: (userList) => {
              setUsers(userList);
              const updatedCurrentUser = userList.find(u => u.id === userData.id);
              if (updatedCurrentUser) {
                setUser(updatedCurrentUser);
              }
            }
          });
          
          showToast('Đã khôi phục project!', 'success');
        } catch (error) {
          console.error('Error restoring project:', error);
          localStorage.removeItem('currentProjectId');
          localStorage.removeItem('currentProjectName');
          localStorage.removeItem('currentUserData');
        }
      }
    }
  }, [authUser, userProfile, documentId]);

  const handleLogin = async (email, password) => {
    try {
      await signInUser(email, password);
      showToast('Đăng nhập thành công!', 'success');
    } catch (error) {
      showToast('Lỗi đăng nhập: ' + error.message, 'error');
    }
  };

  const handleSignup = async (username, email, password) => {
    try {
      console.log('🔵 Step 1: Checking username availability...', username);
      // Step 1: Check username availability
      const isAvailable = await checkUsernameAvailable(username);
      console.log('✅ Username available:', isAvailable);
      
      if (!isAvailable) {
        showToast('Tên người dùng "' + username + '" đã tồn tại. Vui lòng chọn tên khác.', 'error');
        return { success: false };
      }
      
      console.log('🔵 Step 2: Sending OTP to email...', email);
      // Step 2: Send OTP
      await sendOTPEmail(email, username);
      console.log('✅ OTP sent successfully!');
      
      showToast('Mã OTP đã được gửi đến email! Vui lòng kiểm tra hộp thư.', 'success');
      return { success: true, needsOTP: true };
      
    } catch (error) {
      console.error('❌ Error in handleSignup:', error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('Email "' + email + '" đã được đăng ký! Vui lòng đăng nhập hoặc dùng email khác.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast('Mật khẩu quá yếu! Cần ít nhất 6 ký tự.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showToast('Email không hợp lệ!', 'error');
      } else {
        showToast('Lỗi: ' + error.message, 'error');
      }
      return { success: false };
    }
  };
  
  const handleVerifyOTP = async (email, otpCode, username, password) => {
    try {
      // Verify OTP
      await verifyOTP(email, otpCode);
      
      // Create Firebase account
      const user = await signUpUser(email, password, username);
      
      // Create user profile
      await saveUserProfile(user.uid, username);
      
      // Load profile immediately after creation
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      showToast('Đăng ký thành công!', 'success');
      return { success: true };
      
    } catch (error) {
      showToast('Lỗi: ' + error.message, 'error');
      return { success: false };
    }
  };
  
  const handleResendOTP = async (email, username) => {
    try {
      await resendOTP(email, username);
      showToast('Mã OTP mới đã được gửi!', 'success');
    } catch (error) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      // Check if user already has profile
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        showToast(`Chào mừng trở lại ${profile.username}!`, 'success');
      } else {
        // Create profile automatically using Google display name
        const username = user.displayName?.replace(/\s+/g, '_').toLowerCase() || `user_${user.uid.substring(0, 6)}`;
        await saveUserProfile(user.uid, username, user.photoURL);
        const newProfile = await getUserProfile(user.uid);
        setUserProfile(newProfile);
        showToast(`Chào mừng ${username}!`, 'success');
      }
    } catch (error) {
      showToast('Lỗi đăng nhập Google: ' + error.message, 'error');
    }
  };

  const handleSaveProfile = async (newPhotoURL) => {
    try {
      await updateUserAvatar(authUser.uid, newPhotoURL);
      
      // Reload profile
      const profile = await getUserProfile(authUser.uid);
      setUserProfile(profile);
      setShowProfile(false);
      
      showToast('Cập nhật avatar thành công!', 'success');
    } catch (error) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setAuthUser(null);
      setUserProfile(null);
      setShowLanding(true);
      
      // Clear project state from localStorage
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentProjectName');
      localStorage.removeItem('currentUserData');
      
      showToast('Đăng xuất thành công!', 'success');
    } catch (error) {
      showToast('Lỗi đăng xuất: ' + error.message, 'error');
    }
  };

  const handleCreateProject = async (username, projectId, projectName) => {
    // Require login to create project
    if (!authUser || !userProfile) {
      showToast('Bạn cần đăng nhập để tạo project!', 'warning');
      return;
    }

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const shortCode = projectId || `ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Check if user is admin
    const isAdmin = authUser && userProfile && userProfile.username === 'gaulmt';
    
    const userId = authUser.uid;
    
    const newUser = {
      id: userId,
      name: username,
      color: colors[Math.floor(Math.random() * colors.length)],
      role: 'leader',
      permissions: ['read', 'write', 'manage'],
      isAdmin: isAdmin
    };
    
    setUser(newUser);
    setDocumentId(shortCode);
    setProjectName(projectName || `Project ${shortCode}`);
    setShowLanding(false);
    
    // Save to localStorage for reload persistence
    localStorage.setItem('currentProjectId', shortCode);
    localStorage.setItem('currentProjectName', projectName || `Project ${shortCode}`);
    localStorage.setItem('currentUserData', JSON.stringify(newUser));
    
    // Create project metadata and save to user profile
    console.log('📝 Creating project...', { shortCode, userId, username, projectName });
    
    try {
      // Save all project data
      await createProjectMetadata(shortCode, projectName || `Project ${shortCode}`, userId, username);
      console.log('✓ Project metadata created');
      
      await saveUserProject(userId, shortCode, projectName || `Project ${shortCode}`, 'leader');
      console.log('✓ Project saved to user profile');
      
      await saveProjectMember(shortCode, userId, username, 'leader');
      console.log('✓ Project member saved');
      
      console.log('✅ Project created and saved successfully!');
      showToast('Project đã được tạo và lưu thành công!', 'success');
    } catch (error) {
      console.error('❌ Error saving project:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      showToast('Lỗi khi lưu project: ' + error.message, 'error');
    }
    
    joinDocument(shortCode, newUser, {
      onUsersUpdate: (userList) => {
        setUsers(userList);
        const updatedCurrentUser = userList.find(u => u.id === newUser.id);
        if (updatedCurrentUser) {
          setUser(updatedCurrentUser);
        }
      }
    });
  };

  const handleJoinProject = async (username, projectId, savedRole = null, skipCheck = false, savedProjectName = null) => {
    // Require login to join project
    if (!authUser || !userProfile) {
      showToast('Bạn cần đăng nhập để tham gia project!', 'warning');
      return;
    }

    console.log('🔍 Joining project...', { projectId, skipCheck, savedRole, savedProjectName });

    // Check if project exists (skip if opening from saved projects)
    if (!skipCheck) {
      try {
        console.log('Checking if project exists...');
        const exists = await checkProjectExists(projectId);
        console.log('Project exists:', exists);
        
        if (!exists) {
          // Show toast notification - project not found
          showToast(`Project "${projectId}" không tồn tại trên hệ thống!`, 'error');
          return;
        }
        
        // Project exists - show success toast
        showToast('Đang tham gia project...', 'info');
      } catch (error) {
        console.error('❌ Error checking project:', error);
        showToast('Lỗi khi kiểm tra project. Vui lòng thử lại!', 'error');
        return;
      }
    } else {
      console.log('⏭️ Skipping project existence check (opening from saved projects)');
    }

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    
    // Check if user is admin
    const isAdmin = authUser && userProfile && userProfile.username === 'gaulmt';
    
    const userId = authUser.uid;
    
    // Try to get saved role from project members
    let role = savedRole;
    if (!role) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        const rolePromise = getUserRoleInProject(projectId, userId);
        const savedRoleFromProject = await Promise.race([rolePromise, timeoutPromise]);
        if (savedRoleFromProject) {
          role = savedRoleFromProject;
          console.log('✓ Restored role from project:', role);
        }
      } catch (error) {
        console.log('Could not get saved role, using default:', error.message);
      }
    }
    
    // If still no role, use default
    if (!role) {
      role = isAdmin ? 'admin' : 'member';
    }
    
    let permissions = ['read', 'write'];
    if (role === 'leader' || role === 'admin') {
      permissions = ['read', 'write', 'manage'];
    }
    
    const newUser = {
      id: userId,
      name: username,
      color: colors[Math.floor(Math.random() * colors.length)],
      role: role,
      permissions: permissions,
      isAdmin: isAdmin
    };
    
    setUser(newUser);
    setDocumentId(projectId);
    setProjectName(savedProjectName || projectId); // Use saved name or fallback to projectId
    setShowLanding(false);
    
    // Save to localStorage for reload persistence
    localStorage.setItem('currentProjectId', projectId);
    localStorage.setItem('currentProjectName', savedProjectName || projectId);
    localStorage.setItem('currentUserData', JSON.stringify(newUser));
    
    // Save/update member info and last accessed time
    try {
      await updateProjectAccess(userId, projectId);
      await saveProjectMember(projectId, userId, username, role);
      await updateProjectActivity(projectId);
      showToast('Đã tham gia project thành công!', 'success');
      console.log('✅ Joined project successfully');
    } catch (error) {
      console.error('❌ Error joining project:', error);
      showToast('Lỗi khi cập nhật thông tin: ' + error.message, 'warning');
    }
    
    joinDocument(projectId, newUser, {
      onUsersUpdate: (userList) => {
        setUsers(userList);
        // Update current user if role changed
        const updatedCurrentUser = userList.find(u => u.id === newUser.id);
        if (updatedCurrentUser) {
          setUser(updatedCurrentUser);
        }
      }
    });
  };

  const handleResize = (e, panel) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panel === 'userPanel' ? userPanelWidth : 
                       panel === 'fileManager' ? fileManagerWidth : sidebarWidth;

    let animationFrameId = null;

    const onMouseMove = (e) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const diff = panel === 'sidebar' ? startX - e.clientX : e.clientX - startX;
        const newWidth = Math.max(200, Math.min(500, startWidth + diff));
        
        if (panel === 'userPanel') setUserPanelWidth(newWidth);
        else if (panel === 'fileManager') setFileManagerWidth(newWidth);
        else setSidebarWidth(newWidth);
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

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  if (showLanding) {
    return (
      <>
        <Landing 
          onCreateProject={handleCreateProject} 
          onJoinProject={handleJoinProject}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onVerifyOTP={handleVerifyOTP}
          onResendOTP={handleResendOTP}
          onGoogleSignIn={handleGoogleSignIn}
          onLogout={handleLogout}
          authUser={authUser}
          userProfile={userProfile}
          authLoading={authLoading}
          onOpenProfile={() => setShowProfile(true)}
        />
        {showProfile && userProfile && (
          <Profile
            user={userProfile}
            onSave={handleSaveProfile}
            onClose={() => setShowProfile(false)}
          />
        )}
        
        {/* Toast Notifications - Always visible */}
        <div className="toast-container">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`app theme-${theme}`}>
        <div className="resizable-panel" style={{ width: `${userPanelWidth}px` }}>
          <UserPanel 
            users={users} 
            currentUser={user} 
            roomId={documentId} 
            projectName={projectName}
            userProfile={userProfile} 
            authUser={authUser} 
          />
          <div 
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => handleResize(e, 'userPanel')}
          />
        </div>

        <div className="resizable-panel" style={{ width: `${fileManagerWidth}px` }}>
          <FileManager documentId={documentId} currentFile={currentFile} onFileSelect={setCurrentFile} />
          <div 
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => handleResize(e, 'fileManager')}
          />
        </div>

        <div className="main-content" style={{ flex: showSidebar ? '1' : '1 1 auto' }}>
          <Editor 
            documentId={documentId} 
            projectName={projectName} 
            user={user} 
            users={users} 
            currentFile={currentFile} 
            theme={theme} 
            onThemeChange={setTheme}
            authUser={authUser}
            userProfile={userProfile}
            onProjectJoin={handleJoinProject}
          />
        </div>

        {showSidebar && (
          <div className="resizable-panel sidebar-panel" style={{ width: `${sidebarWidth}px` }}>
            <div 
              className="resize-handle resize-handle-left"
              onMouseDown={(e) => handleResize(e, 'sidebar')}
            />
            <Sidebar documentId={documentId} user={user} onClose={() => setShowSidebar(false)} />
          </div>
        )}

        {!showSidebar && (
          <button className="show-sidebar-btn" onClick={() => setShowSidebar(true)}>
            💬
          </button>
        )}

        {/* Confirm Dialog */}
        {confirmDialog && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </div>

      {/* Toast Notifications - Always visible */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

export default App;
