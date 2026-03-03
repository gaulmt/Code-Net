import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, remove, onValue, onDisconnect } from 'firebase/database';
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

// Send OTP via backend API
export const sendOTPEmail = async (email, name) => {
  try {
    const response = await fetch('http://localhost:3002/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send OTP');
    }
    
    // Save OTP to Firebase for verification
    const otpRef = ref(database, `otp_pending/${email.replace(/[.@]/g, '_')}`);
    await set(otpRef, {
      otp: data.otp,
      email: email,
      expiryTime: Date.now() + (5 * 60 * 1000),
      createdAt: Date.now()
    });
    
    console.log('✅ OTP sent to:', email, '| OTP:', data.otp);
    return data.otp;
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otpCode) => {
  const otpRef = ref(database, `otp_pending/${email.replace(/[.@]/g, '_')}`);
  const snapshot = await get(otpRef);
  
  if (!snapshot.exists()) {
    throw new Error('Mã OTP không tồn tại');
  }
  
  const otpData = snapshot.val();
  
  // Check expiry
  if (Date.now() > otpData.expiryTime) {
    await remove(otpRef);
    throw new Error('Mã OTP đã hết hạn (5 phút)');
  }
  
  // Check match
  if (otpData.otp !== otpCode.trim()) {
    throw new Error('Mã OTP không đúng');
  }
  
  // Clean up
  await remove(otpRef);
  return true;
};

// Resend OTP
export const resendOTP = async (email, name) => {
  return await sendOTPEmail(email, name);
};

// Email/Password Sign Up (after OTP verification)
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
// Internal function - only called after accepting friend request
const addFriend = async (userId, friendUserId, friendUsername) => {
  const friendRef = ref(database, `users/${userId}/friends/${friendUserId}`);
  await set(friendRef, {
    username: friendUsername,
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


// ==================== NOTIFICATION SYSTEM ====================

// Create notification
export const createNotification = async (userId, notificationData) => {
  const notificationRef = push(ref(database, `users/${userId}/notifications`));
  await set(notificationRef, {
    ...notificationData,
    id: notificationRef.key,
    read: false,
    createdAt: Date.now()
  });
  return notificationRef.key;
};

// Get user notifications
export const getNotifications = async (userId) => {
  const notificationsRef = ref(database, `users/${userId}/notifications`);
  const snapshot = await get(notificationsRef);
  if (snapshot.exists()) {
    const notifications = [];
    snapshot.forEach((child) => {
      notifications.push({ id: child.key, ...child.val() });
    });
    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  }
  return [];
};

// Subscribe to notifications (real-time)
export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = ref(database, `users/${userId}/notifications`);
  return onValue(notificationsRef, (snapshot) => {
    const notifications = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        notifications.push({ id: child.key, ...child.val() });
      });
    }
    callback(notifications.sort((a, b) => b.createdAt - a.createdAt));
  });
};

// Mark notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
  const notificationRef = ref(database, `users/${userId}/notifications/${notificationId}/read`);
  await set(notificationRef, true);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  const notificationsRef = ref(database, `users/${userId}/notifications`);
  const snapshot = await get(notificationsRef);
  if (snapshot.exists()) {
    const updates = {};
    snapshot.forEach((child) => {
      updates[`${child.key}/read`] = true;
    });
    await set(notificationsRef, updates);
  }
};

// Delete notification
export const deleteNotification = async (userId, notificationId) => {
  const notificationRef = ref(database, `users/${userId}/notifications/${notificationId}`);
  await remove(notificationRef);
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  const notifications = await getNotifications(userId);
  return notifications.filter(n => !n.read).length;
};

// ==================== FRIEND SYSTEM ====================

// Send friend request
export const sendFriendRequest = async (fromUserId, toUserId, fromUsername, fromAvatar) => {
  // Create friend request
  const requestRef = push(ref(database, 'friendRequests'));
  await set(requestRef, {
    from: fromUserId,
    to: toUserId,
    status: 'pending',
    createdAt: Date.now()
  });

  // Create notification for recipient
  await createNotification(toUserId, {
    type: 'friend_request',
    from: fromUserId,
    fromName: fromUsername,
    fromAvatar: fromAvatar,
    message: `${fromUsername} đã gửi lời mời kết bạn`,
    data: { requestId: requestRef.key },
    actionUrl: null
  });

  return requestRef.key;
};

// Accept friend request
export const acceptFriendRequest = async (requestId, fromUserId, toUserId, toUsername, toAvatar) => {
  // Update request status (use update instead of set to preserve existing fields)
  const requestRef = ref(database, `friendRequests/${requestId}/status`);
  await set(requestRef, 'accepted');
  
  const updatedAtRef = ref(database, `friendRequests/${requestId}/updatedAt`);
  await set(updatedAtRef, Date.now());

  // Add to both users' friend lists
  await addFriend(fromUserId, toUserId, toUsername);
  
  // Get fromUser info
  const fromProfile = await getUserProfile(fromUserId);
  await addFriend(toUserId, fromUserId, fromProfile.username);

  // Create notification for requester
  await createNotification(fromUserId, {
    type: 'friend_accepted',
    from: toUserId,
    fromName: toUsername,
    fromAvatar: toAvatar,
    message: `${toUsername} đã chấp nhận lời mời kết bạn`,
    data: {},
    actionUrl: null
  });
};

// Reject friend request
export const rejectFriendRequest = async (requestId) => {
  const statusRef = ref(database, `friendRequests/${requestId}/status`);
  await set(statusRef, 'rejected');
  
  const updatedAtRef = ref(database, `friendRequests/${requestId}/updatedAt`);
  await set(updatedAtRef, Date.now());
};

// Get friend requests for user
export const getFriendRequests = async (userId) => {
  const requestsRef = ref(database, 'friendRequests');
  const snapshot = await get(requestsRef);
  const requests = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      const request = child.val();
      if (request.to === userId && request.status === 'pending') {
        requests.push({ id: child.key, ...request });
      }
    });
  }
  
  return requests;
};

// ==================== PROJECT INVITE SYSTEM ====================

// Send project invite
export const sendProjectInvite = async (projectId, projectName, fromUserId, fromUsername, toUserId) => {
  // Create invite
  const inviteRef = push(ref(database, 'projectInvites'));
  await set(inviteRef, {
    projectId,
    projectName,
    from: fromUserId,
    fromName: fromUsername,
    to: toUserId,
    status: 'pending',
    createdAt: Date.now()
  });

  // Get fromUser profile
  const fromProfile = await getUserProfile(fromUserId);

  // Create notification
  await createNotification(toUserId, {
    type: 'project_invite',
    from: fromUserId,
    fromName: fromUsername,
    fromAvatar: fromProfile.photoURL,
    message: `${fromUsername} đã mời bạn vào project "${projectName}"`,
    data: { 
      inviteId: inviteRef.key,
      projectId,
      projectName 
    },
    actionUrl: null
  });

  return inviteRef.key;
};

// Accept project invite
export const acceptProjectInvite = async (inviteId, projectId, userId, username) => {
  // Update invite status
  const inviteRef = ref(database, `projectInvites/${inviteId}/status`);
  await set(inviteRef, 'accepted');

  // Add user to project
  await saveProjectMember(projectId, userId, username, 'member');
  await saveUserProject(userId, projectId, projectId, 'member');

  return projectId;
};

// Reject project invite
export const rejectProjectInvite = async (inviteId) => {
  const inviteRef = ref(database, `projectInvites/${inviteId}/status`);
  await set(inviteRef, 'rejected');
};

// ==================== GLOBAL CHAT ====================

// Send global chat message
export const sendGlobalChatMessage = async (userId, username, avatar, message) => {
  const messageRef = push(ref(database, 'globalChat/messages'));
  await set(messageRef, {
    userId,
    username,
    avatar,
    message,
    type: 'text',
    timestamp: Date.now(),
    reactions: {}
  });
  return messageRef.key;
};

// Get global chat messages
export const getGlobalChatMessages = async (limit = 50) => {
  const messagesRef = ref(database, 'globalChat/messages');
  const snapshot = await get(messagesRef);
  const messages = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      messages.push({ id: child.key, ...child.val() });
    });
  }
  
  return messages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
};

// Subscribe to global chat (real-time)
export const subscribeToGlobalChat = (callback, limit = 50) => {
  const messagesRef = ref(database, 'globalChat/messages');
  return onValue(messagesRef, (snapshot) => {
    const messages = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        messages.push({ id: child.key, ...child.val() });
      });
    }
    callback(
      messages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .reverse()
    );
  });
};

// Add reaction to message
export const addReactionToMessage = async (messageId, userId, emoji) => {
  const reactionRef = ref(database, `globalChat/messages/${messageId}/reactions/${userId}`);
  await set(reactionRef, emoji);
};
