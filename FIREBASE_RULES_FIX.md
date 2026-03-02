# 🔥 Firebase Rules - PERMISSION_DENIED Fix

## Vấn đề
Khi tạo project mới, gặp lỗi:
```
PERMISSION_DENIED: Permission denied
```

## Nguyên nhân
Firebase Realtime Database Rules không cho phép user write vào:
- `/users/{userId}/projects/{projectCode}`
- `/projects/{projectCode}/metadata`
- `/projects/{projectCode}/members/{userId}`

## Giải pháp

### Bước 1: Truy cập Firebase Console
1. Mở: https://console.firebase.google.com/project/code-together-cfbfa/database/code-together-cfbfa-default-rtdb/rules
2. Đăng nhập với tài khoản Firebase của bạn

### Bước 2: Cập nhật Rules
Thay thế rules hiện tại bằng rules sau:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "projects": {
      "$projectCode": {
        ".read": true,
        ".write": true
      }
    },
    "usernames": {
      ".read": true,
      ".write": true
    },
    "documents": {
      "$documentId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### Bước 3: Publish Rules
1. Click nút "Publish" màu xanh
2. Đợi vài giây để rules được áp dụng

### Bước 4: Test lại
1. Refresh trang web
2. Đăng nhập lại
3. Tạo project mới
4. Kiểm tra console logs - phải thấy ✓ thay vì ❌

## Giải thích Rules

### `/users/{userId}`
```json
".read": "$userId === auth.uid",
".write": "$userId === auth.uid"
```
- Chỉ user đó mới đọc/ghi được data của mình
- Bảo mật profile và projects của user

### `/projects/{projectCode}`
```json
".read": true,
".write": true
```
- Tất cả user đều có thể đọc/ghi
- Cần thiết cho real-time collaboration
- Mọi người trong project đều có thể update

### `/usernames`
```json
".read": true,
".write": true
```
- Public read để check username trùng
- Public write để register username mới

### `/documents/{documentId}`
```json
".read": true,
".write": true
```
- Lưu trữ code files của projects
- Public để collaboration

## Rules an toàn hơn (Optional)

Nếu muốn bảo mật hơn, dùng rules này:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "projects": {
      "$projectCode": {
        "metadata": {
          ".read": true,
          ".write": "auth != null"
        },
        "members": {
          "$memberId": {
            ".read": true,
            ".write": "$memberId === auth.uid || data.parent().child('metadata/createdBy').val() === auth.uid"
          }
        }
      }
    },
    "usernames": {
      ".read": true,
      "$userId": {
        ".write": "$userId === auth.uid && !data.exists()"
      }
    },
    "documents": {
      "$documentId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

Nhưng rules này phức tạp hơn và có thể gây lỗi nếu không cẩn thận.

## Kiểm tra Rules đang dùng

Trong Firebase Console → Database → Rules tab, bạn sẽ thấy rules hiện tại.

Nếu rules là:
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

Thì đây là nguyên nhân gây lỗi PERMISSION_DENIED!

## Sau khi fix

Console logs sẽ hiển thị:
```
📝 Creating project... { shortCode, userId, username, projectName }
✓ saveUserProject success: { userId, projectCode, projectName, role }
✓ createProjectMetadata success: { projectCode, projectName, creatorId, creatorName }
✓ saveProjectMember success: { projectCode, userId, username, role }
✅ Project created and saved successfully!
```

Và project sẽ xuất hiện trong kho Projects!
