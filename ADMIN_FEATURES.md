# 👑 Tính năng Admin đặc biệt

## Admin Account: gaulmt

Tài khoản **gaulmt** có các đặc quyền sau:

### 1. Tích xanh Verified ✓
- Hiển thị tích xanh bên cạnh tên trong:
  - Navbar (trang chủ)
  - User Panel (trong workspace)
  - Team showcase (landing page)
- Màu xanh Twitter (#1DA1F2)
- Drop shadow để nổi bật

### 2. Toàn quyền trong mọi Project

#### Khi tạo project:
- Role: **Leader**
- Permissions: Read + Write + Manage
- Flag: `isAdmin: true`

#### Khi tham gia project:
- Role: **Admin** (đặc biệt)
- Permissions: Read + Write + Manage
- Flag: `isAdmin: true`
- Tự động có quyền cao nhất, không thể bị hạ quyền

### 3. Không thể bị giới hạn quyền
- Leader không thể thay đổi role của admin
- Leader không thể xóa admin khỏi project
- Admin luôn có full permissions

### 4. Badge đặc biệt
- Trong landing page: "👑 ADMIN" badge vàng
- Trong workspace: Tích xanh verified

## Cách tạo Admin Account

### Bước 1: Đăng ký tài khoản
1. Mở app
2. Click "Đăng ký" hoặc "Đăng nhập với Google"
3. Hoàn tất đăng ký

### Bước 2: Đặt username là "gaulmt"
1. Sau khi đăng nhập, hệ thống yêu cầu đặt username
2. Nhập: **gaulmt**
3. Click "Tiếp tục"

### Bước 3: Xác nhận
- Tích xanh sẽ xuất hiện bên cạnh tên
- Vào bất kỳ project nào đều có toàn quyền

## Technical Implementation

### App.jsx
```javascript
// Check if user is admin
const isAdmin = userProfile && userProfile.username === 'gaulmt';

// Create project with admin flag
const newUser = {
  ...
  role: 'leader',
  permissions: ['read', 'write', 'manage'],
  isAdmin: isAdmin
};

// Join project with admin privileges
const newUser = {
  ...
  role: isAdmin ? 'admin' : 'member',
  permissions: isAdmin ? ['read', 'write', 'manage'] : ['read', 'write'],
  isAdmin: isAdmin
};
```

### UserPanel.jsx
```javascript
// Display verified badge for admin
{u.isAdmin && (
  <svg className="verified-badge-user" viewBox="0 0 24 24">
    <path d="..." fill="currentColor"/>
  </svg>
)}
```

### Landing.jsx
```javascript
// Display verified badge in navbar
{userProfile.username === 'gaulmt' && (
  <svg className="verified-badge" viewBox="0 0 24 24">
    <path d="..." fill="currentColor"/>
  </svg>
)}
```

## Thêm Admin mới

Nếu muốn thêm admin khác, sửa code:

### Cách 1: Thêm vào array
```javascript
const ADMIN_USERNAMES = ['gaulmt', 'admin2', 'admin3'];
const isAdmin = userProfile && ADMIN_USERNAMES.includes(userProfile.username);
```

### Cách 2: Check trong Firebase
```javascript
const isAdmin = userProfile && userProfile.isAdmin === true;
```

## Security Notes

⚠️ **Lưu ý bảo mật:**

1. Admin check chỉ ở client-side
2. Nên thêm admin check ở Firebase Rules
3. Không để username "gaulmt" public
4. Thay đổi logic admin cho production

## Firebase Rules cho Admin

Thêm vào Database Rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null || root.child('users').child(auth.uid).child('profile').child('username').val() == 'gaulmt'"
      }
    }
  }
}
```

## Testing

### Test admin features:
1. Đăng ký với username "gaulmt"
2. Tạo project → Check có tích xanh
3. Tham gia project khác → Check có toàn quyền
4. Thử thay đổi permissions → Không bị giới hạn

---

**Admin account đã sẵn sàng! 👑**
