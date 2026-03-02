# 🔍 Hướng dẫn Debug Firebase Project Storage

## Vấn đề hiện tại
Project không được lưu vào kho khi tạo mới, mặc dù code đã có đầy đủ logic lưu trữ.

## Các bước kiểm tra

### 1. Kiểm tra Console Logs
Khi tạo project mới, mở **Developer Console** (F12) và xem logs:

```
📝 Creating project... { shortCode, userId, username, projectName }
✓ Project metadata created
✓ Project saved to user profile
✓ Project member saved
✅ Project created and saved successfully!
```

**Nếu thấy lỗi ❌**, đọc error message để biết nguyên nhân.

### 2. Kiểm tra Firebase Realtime Database Rules

Truy cập: https://console.firebase.google.com/project/code-together-cfbfa/database/code-together-cfbfa-default-rtdb/rules

**Rules cần có:**

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
    }
  }
}
```

### 3. Kiểm tra dữ liệu trong Firebase

Truy cập: https://console.firebase.google.com/project/code-together-cfbfa/database/code-together-cfbfa-default-rtdb/data

**Cấu trúc dữ liệu cần có:**

```
/users
  /{userId}
    /profile
      username: "..."
      photoURL: "..."
    /projects
      /{projectCode}
        code: "ROOM_ABC123"
        name: "My Project"
        role: "leader"
        createdAt: 1234567890
        lastAccessed: 1234567890

/projects
  /{projectCode}
    /metadata
      name: "My Project"
      createdBy: "{userId}"
      creatorName: "username"
      createdAt: 1234567890
      lastActivity: 1234567890
    /members
      /{userId}
        username: "..."
        role: "leader"
        joinedAt: 1234567890
        lastAccessed: 1234567890
```

### 4. Test Flow

#### A. Tạo Project Mới
1. Đăng nhập vào hệ thống
2. Click "Tạo Project Mới"
3. Nhập tên project
4. Click "Tạo Project"
5. **Kiểm tra Console** - phải thấy các log ✓
6. **Kiểm tra Firebase Database** - phải thấy dữ liệu mới

#### B. Mở Project từ Kho
1. Click nút "Projects" trên navbar
2. Phải thấy project vừa tạo trong danh sách
3. Click "Mở" để vào project
4. **Không được hiện lỗi "Project không tồn tại"**

#### C. Join Project (người khác)
1. Người khác đăng nhập
2. Click "Tham Gia Project"
3. Nhập mã project
4. Click "Tham Gia"
5. **Nếu project không tồn tại** → Hiện dialog hỏi có muốn tạo mới không

## Các lỗi thường gặp

### Lỗi: "Permission Denied"
**Nguyên nhân:** Firebase Rules không cho phép write

**Giải pháp:**
1. Vào Firebase Console → Database → Rules
2. Cập nhật rules như trên
3. Click "Publish"

### Lỗi: "Project không tồn tại" khi mở từ kho
**Nguyên nhân:** Logic check exists không skip khi mở từ kho

**Giải pháp:** Đã fix - `skipCheck = true` khi mở từ ProjectsManager

### Lỗi: Project không xuất hiện trong kho
**Nguyên nhân:** 
- Lỗi khi lưu vào `/users/{userId}/projects`
- Hoặc lỗi permission

**Giải pháp:**
1. Check console logs khi tạo project
2. Check Firebase Rules
3. Check dữ liệu trong Firebase Database

## Code Flow

### Tạo Project
```javascript
handleCreateProject()
  → createProjectMetadata()      // Lưu vào /projects/{code}/metadata
  → saveUserProject()            // Lưu vào /users/{userId}/projects/{code}
  → saveProjectMember()          // Lưu vào /projects/{code}/members/{userId}
  → joinDocument()               // Join WebSocket
```

### Join Project
```javascript
handleJoinProject(skipCheck = false)
  → if (!skipCheck) checkProjectExists()  // Kiểm tra project tồn tại
  → updateProjectAccess()                 // Cập nhật lastAccessed
  → saveProjectMember()                   // Lưu member info
  → updateProjectActivity()               // Cập nhật lastActivity
  → joinDocument()                        // Join WebSocket
```

### Mở từ Kho
```javascript
ProjectsManager.handleJoin()
  → onJoinProject(code, savedRole)
  → Landing: onJoinProject(username, code, savedRole, skipCheck = true)
  → App: handleJoinProject(username, code, savedRole, skipCheck = true)
  → Skip checkProjectExists() ✓
```

## Logging đã thêm

### App.jsx - handleCreateProject
- 📝 Creating project...
- ✓ Project metadata created
- ✓ Project saved to user profile
- ✓ Project member saved
- ✅ Project created and saved successfully!
- ❌ Error saving project: (nếu có lỗi)

### App.jsx - handleJoinProject
- 🔍 Joining project...
- Checking if project exists...
- Project exists: true/false
- ⏭️ Skipping project existence check
- ✓ Restored role from project
- ✅ Joined project successfully
- ❌ Error joining project: (nếu có lỗi)

## Next Steps

1. **Tạo project mới** và xem console logs
2. **Kiểm tra Firebase Database** xem có dữ liệu không
3. **Nếu có lỗi permission** → Update Firebase Rules
4. **Nếu không có lỗi nhưng không lưu** → Check network tab (F12 → Network)
5. **Test mở project từ kho** → Phải không có lỗi "không tồn tại"
