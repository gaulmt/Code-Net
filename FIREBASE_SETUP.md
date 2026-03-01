# 🔥 Hướng dẫn cấu hình Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập https://console.firebase.google.com
2. Click **"Add project"** hoặc **"Create a project"**
3. Đặt tên project: `code-net` (hoặc tên bạn muốn)
4. Tắt Google Analytics (không bắt buộc)
5. Click **"Create project"**
6. Đợi Firebase tạo project (~30 giây)

## Bước 2: Bật Realtime Database

1. Trong Firebase Console, menu bên trái → **"Realtime Database"**
2. Click **"Create Database"**
3. Chọn location:
   - **Asia Southeast (Singapore)** - Nếu ở Việt Nam
   - **US Central** - Nếu muốn global
4. Chọn mode: **"Start in test mode"** (tạm thời)
5. Click **"Enable"**

## Bước 3: Cấu hình Database Rules

1. Vào tab **"Rules"**
2. Xóa rules cũ và paste rules này:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    },
    "users": {
      "$userId": {
        ".read": true,
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "usernames": {
      ".read": true,
      ".write": "auth != null"
    },
    "projects": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

3. Click **"Publish"**

## Bước 4: Bật Authentication

1. Menu bên trái → **"Authentication"**
2. Click **"Get started"**
3. Tab **"Sign-in method"**

### Bật Email/Password:
1. Click **"Email/Password"**
2. Toggle **"Enable"**
3. Click **"Save"**

### Bật Google Sign-In:
1. Click **"Google"**
2. Toggle **"Enable"**
3. Nhập **Project support email**: email của bạn
4. Click **"Save"**

## Bước 5: Lấy Firebase Config

1. Click icon **⚙️ (Settings)** → **"Project settings"**
2. Scroll xuống phần **"Your apps"**
3. Click icon **"</>"** (Web app)
4. Đặt tên app: `code-net-web`
5. **KHÔNG** tick "Also set up Firebase Hosting"
6. Click **"Register app"**
7. Copy đoạn config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Bước 6: Thay Config trong Code

### Mở file `client/src/firebase.js`

Tìm đoạn này:
```javascript
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
```

**Thay thế bằng config của bạn:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Lưu file và test:
```bash
cd client
npm run dev
```

## Bước 7: Test Authentication

1. Mở app: http://localhost:5173
2. Click **"Đăng ký"**
3. Nhập email và password
4. Nếu thành công → Firebase đã cấu hình đúng! ✅

## Bước 8: Tạo Admin Account

### Đăng ký tài khoản admin:
1. Đăng ký với Google hoặc Email
2. Đặt username: **gaulmt**
3. Account này sẽ tự động có:
   - Tích xanh verified ✓
   - Toàn quyền trong mọi project
   - Badge "ADMIN"

## Troubleshooting

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra lại `apiKey` trong config
- Đảm bảo copy đúng từ Firebase Console

### Lỗi: "Firebase: Error (auth/unauthorized-domain)"
- Vào Firebase Console → Authentication → Settings
- Tab "Authorized domains"
- Thêm domain: `localhost` và `127.0.0.1`

### Lỗi: "Permission denied"
- Kiểm tra Database Rules
- Đảm bảo đã publish rules

### Lỗi: "Database not found"
- Kiểm tra `databaseURL` trong config
- Đảm bảo đã tạo Realtime Database

## Security Notes

⚠️ **QUAN TRỌNG:**

1. **KHÔNG** commit Firebase config lên GitHub public repo
2. Sử dụng environment variables cho production
3. Cập nhật Database Rules cho production (không dùng test mode)
4. Bật App Check để chống abuse

## Production Database Rules

Khi deploy production, thay rules bằng:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "usernames": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

**Hoàn thành! Firebase đã sẵn sàng! 🎉**
