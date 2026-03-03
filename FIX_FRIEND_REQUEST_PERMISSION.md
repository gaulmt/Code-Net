# ✅ Sửa Lỗi PERMISSION_DENIED Khi Chấp Nhận/Từ Chối Kết Bạn

## 🐛 VẤN ĐỀ

### Lỗi Console:
```
FIREBASE WARNING: set at /friendRequests/-OmIYccEksjppxmJDjlp failed: permission_denied
Error accepting friend request: Error: PERMISSION_DENIED: Permission denied
```

### Triệu chứng:
- Click nút "Chấp nhận" hoặc "Từ chối" → Không có phản hồi
- Console hiển thị lỗi PERMISSION_DENIED
- Thông báo không biến mất
- Không thành bạn bè

## 🔍 NGUYÊN NHÂN

### Vấn đề trong Code:
Code cũ dùng `set()` để ghi đè toàn bộ object:

```javascript
// ❌ SAI - Ghi đè toàn bộ object
const requestRef = ref(database, `friendRequests/${requestId}`);
await set(requestRef, {
  status: 'accepted',
  updatedAt: Date.now()
});
```

### Vấn đề với Firebase Rules:
Firebase Rules yêu cầu object phải có đầy đủ các field:

```json
"friendRequests": {
  "$requestId": {
    ".validate": "newData.hasChildren(['from', 'to', 'status', 'createdAt'])"
  }
}
```

Khi dùng `set()` để ghi đè, object mới chỉ có `{status, updatedAt}` → Thiếu `from`, `to`, `createdAt` → PERMISSION_DENIED!

## ✅ GIẢI PHÁP

### Sửa Code:
Thay vì ghi đè toàn bộ object, chỉ update field `status`:

```javascript
// ✅ ĐÚNG - Chỉ update field status
const statusRef = ref(database, `friendRequests/${requestId}/status`);
await set(statusRef, 'accepted');

const updatedAtRef = ref(database, `friendRequests/${requestId}/updatedAt`);
await set(updatedAtRef, Date.now());
```

## 📝 CODE ĐÃ SỬA

### File: `client/src/firebase.js`

#### 1. acceptFriendRequest:
```javascript
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
```

#### 2. rejectFriendRequest:
```javascript
// Reject friend request
export const rejectFriendRequest = async (requestId) => {
  const statusRef = ref(database, `friendRequests/${requestId}/status`);
  await set(statusRef, 'rejected');
  
  const updatedAtRef = ref(database, `friendRequests/${requestId}/updatedAt`);
  await set(updatedAtRef, Date.now());
};
```

## 🎯 CÁCH HOẠT ĐỘNG

### Trước (Ghi đè toàn bộ):
```
friendRequests/
  -OmIYccEksjppxmJDjlp/
    from: "user1"
    to: "user2"
    status: "pending"
    createdAt: 1234567890

↓ set(requestRef, {status: 'accepted', updatedAt: ...})

friendRequests/
  -OmIYccEksjppxmJDjlp/
    status: "accepted"        ← Chỉ còn 2 field
    updatedAt: 1234567999     ← Thiếu from, to, createdAt
                              ← PERMISSION_DENIED!
```

### Sau (Chỉ update field):
```
friendRequests/
  -OmIYccEksjppxmJDjlp/
    from: "user1"
    to: "user2"
    status: "pending"
    createdAt: 1234567890

↓ set(requestRef/status, 'accepted')

friendRequests/
  -OmIYccEksjppxmJDjlp/
    from: "user1"             ← Giữ nguyên
    to: "user2"               ← Giữ nguyên
    status: "accepted"        ← Update
    createdAt: 1234567890     ← Giữ nguyên
    updatedAt: 1234567999     ← Thêm mới
                              ← SUCCESS!
```

## 🧪 CÁCH TEST

### Bước 1: Refresh Browser
```
Ctrl + Shift + R
```

### Bước 2: Test Chấp Nhận Kết Bạn
1. User A gửi lời mời kết bạn cho User B
2. User B nhận thông báo
3. User B click "Chấp nhận"
4. Kiểm tra:
   - ✅ Thông báo biến mất
   - ✅ Không có lỗi trong Console
   - ✅ User A nhận thông báo "đã chấp nhận"
   - ✅ Cả 2 thành bạn bè

### Bước 3: Test Từ Chối Kết Bạn
1. User A gửi lời mời kết bạn cho User C
2. User C nhận thông báo
3. User C click "Từ chối"
4. Kiểm tra:
   - ✅ Thông báo biến mất
   - ✅ Không có lỗi trong Console
   - ✅ Không thành bạn bè

### Bước 4: Kiểm tra Firebase
1. Mở Firebase Console
2. Realtime Database → Data
3. Vào `friendRequests/{requestId}`
4. Kiểm tra:
   - ✅ `status` = "accepted" hoặc "rejected"
   - ✅ Vẫn còn `from`, `to`, `createdAt`
   - ✅ Có thêm `updatedAt`

## 🔧 TROUBLESHOOTING

### Vẫn còn lỗi PERMISSION_DENIED:

#### 1. Clear Cache:
```
Ctrl + Shift + R (Hard refresh)
```

#### 2. Kiểm tra Firebase Rules:
- Mở Firebase Console
- Realtime Database → Rules
- Đảm bảo có:
```json
"friendRequests": {
  "$requestId": {
    ".read": "auth != null",
    ".write": "auth != null",
    ".validate": "newData.hasChildren(['from', 'to', 'status', 'createdAt'])"
  }
}
```

#### 3. Kiểm tra User đã đăng nhập:
```javascript
// Trong Console
console.log(auth.currentUser);
// Phải có user object, không phải null
```

#### 4. Kiểm tra requestId:
```javascript
// Trong Console khi click "Chấp nhận"
console.log('Request ID:', notification.data.requestId);
// Phải có giá trị, không phải undefined
```

## 📊 SO SÁNH

### Trước khi sửa:
- ❌ Click "Chấp nhận" → Lỗi PERMISSION_DENIED
- ❌ Thông báo không biến mất
- ❌ Không thành bạn bè
- ❌ Console đầy lỗi

### Sau khi sửa:
- ✅ Click "Chấp nhận" → Thành công
- ✅ Thông báo biến mất
- ✅ Thành bạn bè
- ✅ User A nhận thông báo
- ✅ Console sạch sẽ

## 🎓 BÀI HỌC

### Khi làm việc với Firebase:
1. **Hiểu rõ Rules:** Đọc kỹ `.validate` để biết yêu cầu
2. **Dùng đúng method:**
   - `set(ref, object)` → Ghi đè toàn bộ
   - `set(ref/field, value)` → Update 1 field
   - `update(ref, {field: value})` → Update nhiều field
3. **Test kỹ:** Luôn kiểm tra Console và Firebase Data
4. **Debug:** Dùng console.log để xem data trước khi ghi

### Best Practice:
```javascript
// ✅ GOOD - Update specific field
const statusRef = ref(database, `path/${id}/status`);
await set(statusRef, 'newValue');

// ❌ BAD - Overwrite entire object
const objectRef = ref(database, `path/${id}`);
await set(objectRef, {status: 'newValue'});
```

## ✅ CHECKLIST

- [ ] Refresh browser (Ctrl + Shift + R)
- [ ] Test gửi lời mời kết bạn
- [ ] Test chấp nhận lời mời
- [ ] Kiểm tra không có lỗi Console
- [ ] Kiểm tra thành bạn bè
- [ ] Test từ chối lời mời
- [ ] Kiểm tra Firebase Data

---

**Status:** ✅ Đã sửa  
**File:** `client/src/firebase.js`  
**Next:** Refresh và test lại
