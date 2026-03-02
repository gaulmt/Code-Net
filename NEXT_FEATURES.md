# Các tính năng cần thêm

## ✅ Đã hoàn thành:
1. Logo codenet.jpg trên thanh tiêu đề web
2. Theme chỉ đổi màu nền, giữ nguyên viền

## 🔄 Đang làm:
3. Download popup với lựa chọn files
   - Component: DownloadModal.jsx (đã tạo)
   - Cần: Tích hợp vào Editor.jsx

## 📋 Cần làm tiếp:
4. Ghi nhớ vị trí file cuối cùng
   - Lưu vào localStorage: `lastOpenedFile_{projectId}`
   
5. Tính năng kết bạn
   - Firebase: `users/{userId}/friends/{friendId}`
   - Component: FriendsList.jsx
   
6. Thay đổi avatar từ ảnh máy
   - Upload ảnh lên Firebase Storage
   - Update photoURL trong profile
   
7. Nút + thêm thành viên trong UserPanel
   - Hiển thị popup với:
     * Mã phòng (copy)
     * Danh sách bạn bè
     * Chấm xanh (online) / xám (offline)
     * Tích xanh cho admin
   - Component: InviteMembersModal.jsx

## Gợi ý triển khai:

### Download Modal (đã tạo sẵn):
```jsx
// Trong Editor.jsx
import DownloadModal from './DownloadModal';

const [showDownloadModal, setShowDownloadModal] = useState(false);
const [allFiles, setAllFiles] = useState([]);

// Load files
useEffect(() => {
  if (documentId) {
    getFiles(documentId, (files) => setAllFiles(files));
  }
}, [documentId]);

// Handle download
const handleDownloadFiles = (selectedFiles) => {
  selectedFiles.forEach(fileName => {
    // Download logic
  });
};
```

### Last Opened File:
```jsx
// Save on file change
useEffect(() => {
  if (currentFile && documentId) {
    localStorage.setItem(`lastFile_${documentId}`, currentFile);
  }
}, [currentFile, documentId]);

// Load on mount
useEffect(() => {
  const lastFile = localStorage.getItem(`lastFile_${documentId}`);
  if (lastFile) {
    // Set current file to lastFile
  }
}, [documentId]);
```

### Friends System:
```javascript
// firebase.js
export const addFriend = async (userId, friendId) => {
  await set(ref(database, `users/${userId}/friends/${friendId}`), {
    addedAt: Date.now(),
    status: 'pending'
  });
};

export const getFriends = async (userId) => {
  const friendsRef = ref(database, `users/${userId}/friends`);
  const snapshot = await get(friendsRef);
  return snapshot.val() || {};
};
```

### Avatar Upload:
```javascript
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadAvatar = async (userId, file) => {
  const storage = getStorage();
  const avatarRef = storageRef(storage, `avatars/${userId}`);
  await uploadBytes(avatarRef, file);
  const url = await getDownloadURL(avatarRef);
  await updateUserAvatar(userId, url);
  return url;
};
```

## Ưu tiên:
1. Download Modal (80% done)
2. Last opened file (dễ)
3. Invite members modal (trung bình)
4. Friends system (phức tạp)
5. Avatar upload (trung bình)
