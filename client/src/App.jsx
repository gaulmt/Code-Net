import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import UserPanel from './components/UserPanel';
import FileManager from './components/FileManager';
import Landing from './components/Landing';
import Profile from './components/Profile';
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
  updateUserAvatar
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState('');
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

  const handleLogin = async (email, password) => {
    try {
      await signInUser(email, password);
      alert('Đăng nhập thành công!');
    } catch (error) {
      alert('Lỗi đăng nhập: ' + error.message);
    }
  };

  const handleSignup = async (username, email, password) => {
    try {
      await signUpUser(email, password, username);
      alert('Đăng ký thành công!');
    } catch (error) {
      alert('Lỗi đăng ký: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      // Check if user already has profile
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        alert(`Chào mừng trở lại ${profile.username}!`);
      }
      // If no profile, Landing will show username setup
    } catch (error) {
      alert('Lỗi đăng nhập Google: ' + error.message);
    }
  };

  const handleUsernameSet = async (username) => {
    try {
      // Check if username is available
      const isAvailable = await checkUsernameAvailable(username);
      if (!isAvailable) {
        alert('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
        return;
      }

      // Save user profile
      await saveUserProfile(authUser.uid, username);
      
      // Reload profile
      const profile = await getUserProfile(authUser.uid);
      setUserProfile(profile);
      
      alert(`Chào mừng ${username}!`);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleSaveProfile = async (newPhotoURL) => {
    try {
      await updateUserAvatar(authUser.uid, newPhotoURL);
      
      // Reload profile
      const profile = await getUserProfile(authUser.uid);
      setUserProfile(profile);
      setShowProfile(false);
      
      alert('Cập nhật avatar thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setAuthUser(null);
      setUserProfile(null);
      setShowLanding(true);
      alert('Đăng xuất thành công!');
    } catch (error) {
      alert('Lỗi đăng xuất: ' + error.message);
    }
  };

  const handleCreateProject = async (username, projectId, projectName) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const shortCode = projectId || `ROOM_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Check if user is admin
    const isAdmin = userProfile && userProfile.username === 'gaulmt';
    
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: username,
      color: colors[Math.floor(Math.random() * colors.length)],
      role: 'leader',
      permissions: ['read', 'write', 'manage'],
      isAdmin: isAdmin
    };
    
    setUser(newUser);
    setDocumentId(shortCode);
    setShowLanding(false);
    
    // Save project to user's profile if logged in
    if (authUser) {
      try {
        await saveUserProject(authUser.uid, shortCode, projectName || `Project ${shortCode}`);
        console.log('Project saved to user profile');
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
    
    joinDocument(shortCode, newUser, {
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

  const handleJoinProject = (username, projectId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    
    // Check if user is admin
    const isAdmin = userProfile && userProfile.username === 'gaulmt';
    
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: username,
      color: colors[Math.floor(Math.random() * colors.length)],
      role: isAdmin ? 'admin' : 'member',
      permissions: isAdmin ? ['read', 'write', 'manage'] : ['read', 'write'],
      isAdmin: isAdmin
    };
    
    setUser(newUser);
    setDocumentId(projectId);
    setShowLanding(false);
    
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
          onGoogleSignIn={handleGoogleSignIn}
          onLogout={handleLogout}
          authUser={authUser}
          userProfile={userProfile}
          authLoading={authLoading}
          onUsernameSet={handleUsernameSet}
          onOpenProfile={() => setShowProfile(true)}
        />
        {showProfile && userProfile && (
          <Profile
            user={userProfile}
            onSave={handleSaveProfile}
            onClose={() => setShowProfile(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="app">
      <div className="resizable-panel" style={{ width: `${userPanelWidth}px` }}>
        <UserPanel users={users} currentUser={user} roomId={documentId} userProfile={userProfile} />
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
        <Editor documentId={documentId} user={user} users={users} currentFile={currentFile} />
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
    </div>
  );
}

export default App;
