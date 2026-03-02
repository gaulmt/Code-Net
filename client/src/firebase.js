import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6hrAzFg-m-EnKX1VxvpGb5Ui0EKtkv28",
  authDomain: "code-together-cfbfa.firebaseapp.com",
  databaseURL: "https://code-together-cfbfa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "code-together-cfbfa",
  storageBucket: "code-together-cfbfa.firebasestorage.app",
  messagingSenderId: "462255130229",
  appId: "1:462255130229:web:38375b2adc62cea3d2da3c",
  measurementId: "G-P2QNFE1THL"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Email/Password Sign Up
export const signUpUser = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

// Email/Password Sign In
export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Google Sign In
export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

// Sign Out
export const signOutUser = async () => {
  await signOut(auth);
};

// Save user's project to their profile
export const saveUserProject = async (userId, projectCode, projectName, role = 'leader') => {
  try {
    const projectRef = ref(database, `users/${userId}/projects/${projectCode}`);
    await set(projectRef, {
      code: projectCode,
      name: projectName || 'Untitled Project',
      role: role, // Save user's role in this project
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });
    console.log('✓ saveUserProject success:', { userId, projectCode, projectName, role });
  } catch (error) {
    console.error('❌ saveUserProject failed:', error);
    throw error;
  }
};

// Get user's projects
export const getUserProjects = async (userId) => {
  const projectsRef = ref(database, `users/${userId}/projects`);
  const snapshot = await get(projectsRef);
  if (snapshot.exists()) {
    return Object.values(snapshot.val());
  }
  return [];
};

// Update project last accessed time
export const updateProjectAccess = async (userId, projectCode) => {
  const projectRef = ref(database, `users/${userId}/projects/${projectCode}/lastAccessed`);
  await set(projectRef, Date.now());
};

// Check if username is available
export const checkUsernameAvailable = async (username) => {
  const usernamesRef = ref(database, 'usernames');
  const snapshot = await get(usernamesRef);
  if (snapshot.exists()) {
    const usernames = snapshot.val();
    return !Object.values(usernames).includes(username.toLowerCase());
  }
  return true;
};

// Save user profile with unique username
export const saveUserProfile = async (userId, username, photoURL) => {
  // Save username mapping
  const usernameRef = ref(database, `usernames/${userId}`);
  await set(usernameRef, username.toLowerCase());
  
  // Save user profile
  const profileRef = ref(database, `users/${userId}/profile`);
  await set(profileRef, {
    username: username,
    photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
};

// Get user profile
export const getUserProfile = async (userId) => {
  const profileRef = ref(database, `users/${userId}/profile`);
  const snapshot = await get(profileRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Update user avatar
export const updateUserAvatar = async (userId, photoURL) => {
  const avatarRef = ref(database, `users/${userId}/profile/photoURL`);
  await set(avatarRef, photoURL);
  
  const updatedRef = ref(database, `users/${userId}/profile/updatedAt`);
  await set(updatedRef, Date.now());
};

// Delete user project
export const deleteUserProject = async (userId, projectCode) => {
  const projectRef = ref(database, `users/${userId}/projects/${projectCode}`);
  await set(projectRef, null);
};

// Share project - add collaborator
export const shareProject = async (projectCode, collaboratorUserId) => {
  const collabRef = ref(database, `projects/${projectCode}/collaborators/${collaboratorUserId}`);
  await set(collabRef, {
    addedAt: Date.now(),
    role: 'member'
  });
};

// Get project collaborators
export const getProjectCollaborators = async (projectCode) => {
  const collabRef = ref(database, `projects/${projectCode}/collaborators`);
  const snapshot = await get(collabRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

// Check if project exists
export const checkProjectExists = async (projectCode) => {
  const projectRef = ref(database, `projects/${projectCode}`);
  const snapshot = await get(projectRef);
  return snapshot.exists();
};

// Create project metadata when project is first created
export const createProjectMetadata = async (projectCode, projectName, creatorId, creatorName) => {
  try {
    const projectRef = ref(database, `projects/${projectCode}/metadata`);
    await set(projectRef, {
      name: projectName,
      createdBy: creatorId,
      creatorName: creatorName,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });
    console.log('✓ createProjectMetadata success:', { projectCode, projectName, creatorId, creatorName });
  } catch (error) {
    console.error('❌ createProjectMetadata failed:', error);
    throw error;
  }
};

// Update project last activity
export const updateProjectActivity = async (projectCode) => {
  const activityRef = ref(database, `projects/${projectCode}/metadata/lastActivity`);
  await set(activityRef, Date.now());
};

// Get user's role in a project
export const getUserProjectRole = async (userId, projectCode) => {
  const projectRef = ref(database, `users/${userId}/projects/${projectCode}/role`);
  const snapshot = await get(projectRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Save project member info (for tracking who has access)
export const saveProjectMember = async (projectCode, userId, username, role) => {
  try {
    const memberRef = ref(database, `projects/${projectCode}/members/${userId}`);
    await set(memberRef, {
      username: username,
      role: role,
      joinedAt: Date.now(),
      lastAccessed: Date.now()
    });
    console.log('✓ saveProjectMember success:', { projectCode, userId, username, role });
  } catch (error) {
    console.error('❌ saveProjectMember failed:', error);
    throw error;
  }
};

// Get user's saved role from project members
export const getUserRoleInProject = async (projectCode, userId) => {
  const memberRef = ref(database, `projects/${projectCode}/members/${userId}`);
  const snapshot = await get(memberRef);
  if (snapshot.exists()) {
    return snapshot.val().role;
  }
  return null;
};

// Friends System
export const addFriend = async (userId, friendUserId, friendUsername) => {
  const friendRef = ref(database, `users/${userId}/friends/${friendUserId}`);
  await set(friendRef, {
    username: friendUsername,
    addedAt: Date.now(),
    status: 'accepted' // Can be: pending, accepted, blocked
  });
  
  // Add reverse friendship
  const reverseFriendRef = ref(database, `users/${friendUserId}/friends/${userId}`);
  const userProfile = await getUserProfile(userId);
  await set(reverseFriendRef, {
    username: userProfile?.username || 'Unknown',
    addedAt: Date.now(),
    status: 'accepted'
  });
};

export const getFriends = async (userId) => {
  const friendsRef = ref(database, `users/${userId}/friends`);
  const snapshot = await get(friendsRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

export const removeFriend = async (userId, friendUserId) => {
  await set(ref(database, `users/${userId}/friends/${friendUserId}`), null);
  await set(ref(database, `users/${friendUserId}/friends/${userId}`), null);
};

// Online Status
export const setUserOnline = (userId) => {
  const statusRef = ref(database, `users/${userId}/status`);
  set(statusRef, {
    online: true,
    lastSeen: Date.now()
  });
  
  // Set offline on disconnect
  onDisconnect(statusRef).set({
    online: false,
    lastSeen: Date.now()
  });
};

export const getUserStatus = async (userId) => {
  const statusRef = ref(database, `users/${userId}/status`);
  const snapshot = await get(statusRef);
  return snapshot.val() || { online: false, lastSeen: null };
};

// Search users by username
export const searchUserByUsername = async (username) => {
  const usernamesRef = ref(database, 'usernames');
  const snapshot = await get(usernamesRef);
  
  if (snapshot.exists()) {
    const usernames = snapshot.val();
    for (const [userId, uname] of Object.entries(usernames)) {
      if (uname.toLowerCase() === username.toLowerCase()) {
        const profile = await getUserProfile(userId);
        return { userId, ...profile };
      }
    }
  }
  return null;
};
