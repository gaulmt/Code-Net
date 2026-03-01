import { ref, set, onValue, push, onDisconnect, serverTimestamp, update, remove } from 'firebase/database';
import { database } from './firebase';

export const joinDocument = (documentId, user, callbacks) => {
  const userRef = ref(database, `documents/${documentId}/users/${user.id}`);
  const contentRef = ref(database, `documents/${documentId}/content`);
  const chatRef = ref(database, `documents/${documentId}/chat`);
  const cursorsRef = ref(database, `documents/${documentId}/cursors`);
  
  // Set user presence with role
  set(userRef, {
    name: user.name,
    color: user.color,
    role: user.role || 'member',
    permissions: user.permissions || ['read', 'write'],
    lastSeen: serverTimestamp()
  });
  
  // Remove user on disconnect
  onDisconnect(userRef).remove();
  onDisconnect(ref(database, `documents/${documentId}/cursors/${user.id}`)).remove();
  
  // Listen to content changes
  onValue(contentRef, (snapshot) => {
    const data = snapshot.val();
    if (data && callbacks.onContentUpdate) {
      callbacks.onContentUpdate(data);
    }
  });
  
  // Listen to users
  onValue(ref(database, `documents/${documentId}/users`), (snapshot) => {
    const users = [];
    snapshot.forEach((child) => {
      users.push({ id: child.key, ...child.val() });
    });
    if (callbacks.onUsersUpdate) {
      callbacks.onUsersUpdate(users);
    }
  });
  
  // Listen to chat
  onValue(chatRef, (snapshot) => {
    const messages = [];
    snapshot.forEach((child) => {
      messages.push({ id: child.key, ...child.val() });
    });
    if (callbacks.onChatUpdate) {
      callbacks.onChatUpdate(messages);
    }
  });

  // Listen to cursors
  onValue(cursorsRef, (snapshot) => {
    const cursors = {};
    snapshot.forEach((child) => {
      cursors[child.key] = child.val();
    });
    if (callbacks.onCursorsUpdate) {
      callbacks.onCursorsUpdate(cursors);
    }
  });
  
  return { userRef, contentRef, chatRef, cursorsRef };
};

export const updateContent = (documentId, fileName, content) => {
  const contentRef = ref(database, `documents/${documentId}/files/${fileName.replace(/\./g, '_')}/content`);
  set(contentRef, {
    text: content,
    updatedAt: serverTimestamp()
  });
};

export const updateCursor = (documentId, userId, position) => {
  const cursorRef = ref(database, `documents/${documentId}/cursors/${userId}`);
  set(cursorRef, {
    line: position.lineNumber,
    column: position.column,
    updatedAt: serverTimestamp()
  });
};

export const sendChatMessage = (documentId, user, message) => {
  const chatRef = ref(database, `documents/${documentId}/chat`);
  push(chatRef, {
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    message,
    timestamp: serverTimestamp()
  });
};

export const getFiles = (documentId, callback) => {
  const filesRef = ref(database, `documents/${documentId}/files`);
  onValue(filesRef, (snapshot) => {
    const files = [];
    snapshot.forEach((child) => {
      // Convert back: main_js -> main.js
      const fileName = child.key.replace(/_([^_]+)$/, '.$1');
      files.push({ name: fileName, ...child.val() });
    });
    if (files.length === 0) {
      // Create default file
      addFile(documentId, 'main.js');
    }
    callback(files);
  });
};

export const addFile = (documentId, fileName) => {
  const fileRef = ref(database, `documents/${documentId}/files/${fileName.replace(/\./g, '_')}`);
  set(fileRef, {
    content: { text: '// Bắt đầu code...\n', updatedAt: serverTimestamp() },
    createdAt: serverTimestamp()
  });
};

export const deleteFile = (documentId, fileName) => {
  const fileRef = ref(database, `documents/${documentId}/files/${fileName.replace(/\./g, '_')}`);
  remove(fileRef);
};

export const uploadFile = (documentId, fileName, content) => {
  const fileRef = ref(database, `documents/${documentId}/files/${fileName.replace(/\./g, '_')}`);
  set(fileRef, {
    content: { text: content, updatedAt: serverTimestamp() },
    createdAt: serverTimestamp()
  });
};

export const getFileContent = (documentId, fileName, callback) => {
  const contentRef = ref(database, `documents/${documentId}/files/${fileName.replace(/\./g, '_')}/content`);
  onValue(contentRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const updateUserRole = (documentId, userId, newRole, permissions) => {
  const userRef = ref(database, `documents/${documentId}/users/${userId}`);
  update(userRef, {
    role: newRole,
    permissions: permissions || ['read']
  });
};

export const updateUserPermissions = (documentId, userId, permissions) => {
  const userRef = ref(database, `documents/${documentId}/users/${userId}`);
  update(userRef, {
    permissions: permissions
  });
};

export const transferLeadership = (documentId, currentLeaderId, newLeaderId) => {
  // Update current leader to member
  const currentLeaderRef = ref(database, `documents/${documentId}/users/${currentLeaderId}`);
  update(currentLeaderRef, {
    role: 'member',
    permissions: ['read', 'write']
  });

  // Update new leader
  const newLeaderRef = ref(database, `documents/${documentId}/users/${newLeaderId}`);
  update(newLeaderRef, {
    role: 'leader',
    permissions: ['read', 'write', 'manage']
  });
};

export const checkUserPermission = (user, permission) => {
  return user?.permissions?.includes(permission) || false;
};
