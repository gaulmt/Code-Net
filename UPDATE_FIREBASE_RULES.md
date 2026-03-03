# Cập Nhật Firebase Rules - BẮT BUỘC

## Vấn Đề
Lỗi `PERMISSION_DENIED` khi check username vì Firebase Database Rules không cho phép đọc `usernames`.

## Giải Pháp

### Bước 1: Vào Firebase Console
```
https://console.firebase.google.com/
→ Chọn project: code-together-cfbfa
→ Realtime Database
→ Rules (tab)
```

### Bước 2: Copy Rules Mới

Thay thế toàn bộ rules hiện tại bằng:

```json
{
  "rules": {
    "usernames": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "projects": {
      "$projectId": {
        ".read": true,
        ".write": true
      }
    },
    "conversations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "community": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### Bước 3: Publish Rules

1. Click nút **"Publish"** ở góc trên bên phải
2. Đợi vài giây để rules được apply

### Bước 4: Test

1. Refresh browser (Ctrl+R)
2. Thử đăng ký với username mới
3. Xem console logs:
   ```
   🔵 Step 1: Checking username availability... test
   ✅ Username available: true
   🔵 Step 2: Sending OTP to email...
   ✅ OTP sent successfully!
   ```

## Giải Thích Rules

### `usernames` - Public Read
```json
"usernames": {
  ".read": true,           // Ai cũng đọc được (để check trùng)
  ".write": "auth != null" // Chỉ user đã login mới ghi được
}
```

### `users` - Private
```json
"users": {
  "$uid": {
    ".read": "auth != null && auth.uid == $uid",  // Chỉ đọc data của mình
    ".write": "auth != null && auth.uid == $uid"  // Chỉ ghi data của mình
  }
}
```

### `projects` - Public (Collaborative)
```json
"projects": {
  "$projectId": {
    ".read": true,   // Ai cũng đọc được (để join project)
    ".write": true   // Ai cũng ghi được (collaborative editing)
  }
}
```

### `conversations` - Authenticated Only
```json
"conversations": {
  ".read": "auth != null",   // Chỉ user đã login
  ".write": "auth != null"   // Chỉ user đã login
}
```

### `community` - Public Read, Auth Write
```json
"community": {
  ".read": true,           // Ai cũng xem được posts
  ".write": "auth != null" // Chỉ user đã login mới post được
}
```

## Error Messages

### Trước khi fix:
```
❌ Error: Permission denied at checkUsernameAvailable
```

### Sau khi fix:
```
✅ Username available: true
✅ OTP sent successfully!
```

## Kiểm Tra Rules Đã Apply

Vào Firebase Console → Realtime Database → Rules

Nếu thấy:
```json
"usernames": {
  ".read": true,
  ...
}
```

→ Rules đã được apply thành công! ✅

## Nếu Vẫn Lỗi

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+Shift+R
3. **Đợi 1-2 phút** để Firebase sync rules
4. **Check lại Rules** trong Firebase Console

## Status

⏳ Đang chờ update Firebase Rules
✅ Code đã sẵn sàng
✅ Messages đã được cải thiện:
   - "Tên người dùng 'xxx' đã tồn tại"
   - "Email 'xxx' đã được đăng ký"
