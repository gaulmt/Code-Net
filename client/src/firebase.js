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
export const saveUserProject = async (userId, projectCode, projectName) => {
  const projectRef = ref(database, `users/${userId}/projects/${projectCode}`);
  await set(projectRef, {
    code: projectCode,
    name: projectName || 'Untitled Project',
    createdAt: Date.now(),
    lastAccessed: Date.now()
  });
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
