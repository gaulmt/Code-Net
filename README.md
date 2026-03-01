# Code Net - Real-time Collaborative Code Editor

Nền tảng code cộng tác real-time với quản lý team chuyên nghiệp và WebAssembly compilation.

## 🚀 Tính năng

- ✨ **Real-time Collaboration** - Code cùng nhau như Google Docs
- 🎨 **Monaco Editor** - Trình soạn thảo code của VS Code
- 🔥 **WebAssembly Compilation** - Chạy code local nhanh hơn
- 👥 **Team Management** - Phân quyền chi tiết với 5 vai trò
- 🌐 **Multi-language** - JavaScript, Python, HTML, Java, C++, TypeScript
- ☁️ **Firebase Realtime DB** - Lưu trữ đám mây tự động
- 🔐 **Firebase Auth** - Đăng nhập bảo mật

## 🛠️ Cài đặt

### Yêu cầu
- Node.js 16+ 
- npm hoặc yarn

### Bước 1: Clone project
```bash
git clone <repository-url>
cd code_together
```

### Bước 2: Cài đặt dependencies
```bash
cd client
npm install
```

### Bước 3: Chạy development server

**Trên Windows (CMD):**
```cmd
cd client
npm run dev
```

**Trên Windows (PowerShell):**
Nếu gặp lỗi execution policy, chạy PowerShell as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned
```
Sau đó:
```powershell
cd client
npm run dev
```

**Trên Mac/Linux:**
```bash
cd client
npm run dev
```

### Bước 4: Mở browser
Truy cập: `http://localhost:5173`

## 🎯 Cách sử dụng

### 1. Tạo Project
- Click "Tạo Project Mới"
- Nhập tên của bạn
- Nhận mã room (VD: ROOM_ABC123)
- Chia sẻ mã với team

### 2. Tham gia Project
- Click "Tham Gia Project"
- Nhập tên và mã room
- Bắt đầu code

### 3. Chạy code với WebAssembly

#### JavaScript
- Chọn mode **WASM** (mặc định)
- Code chạy ngay lập tức trên browser
- Nhanh hơn API mode

#### Python
- Chọn mode **WASM**
- Lần đầu sẽ tải Pyodide (~10MB, cache lại)
- Lần sau chạy nhanh

#### HTML/CSS
- Tự động render trong iframe preview
- Click nút phóng to để xem fullscreen
- Hỗ trợ JavaScript inline

#### Các ngôn ngữ khác (Java, C++, TypeScript)
- Tự động dùng API mode
- Chạy trên EMKC Piston server

### 4. Quản lý team (Leader)

**Vai trò:**
- 👑 **Leader** - Quản lý toàn bộ team
- 💻 **Developer** - Lập trình viên (Read + Write)
- 🎨 **Designer** - Thiết kế UI/UX (Read + Write)
- 👤 **Member** - Thành viên (Read + Write)
- 👁️ **Viewer** - Chỉ xem (Read only)

**Phân quyền:**
- Click icon ⋮ bên cạnh tên user
- Chọn vai trò hoặc tùy chỉnh quyền Read/Write
- Có thể chuyển quyền Leader cho người khác

## 🔧 Công nghệ

- **Frontend**: React + Vite
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Database**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Compilation**: 
  - WebAssembly (JavaScript, Python, HTML)
  - EMKC Piston API (Java, C++, C, TypeScript)
- **Python WASM**: Pyodide v0.24.1
- **Styling**: Custom CSS with Glass Morphism

## 📝 Shortcuts

- `Ctrl + Enter` - Chạy code
- `Ctrl + S` - Lưu file (tự động)

## 🐛 Troubleshooting

### Lỗi: "npm is not recognized"
- Cài đặt Node.js từ https://nodejs.org
- Restart terminal sau khi cài

### Lỗi: "running scripts is disabled"
- Chạy PowerShell as Administrator
- Chạy: `Set-ExecutionPolicy RemoteSigned`

### Lỗi: "Cannot find module"
- Xóa folder `node_modules`
- Chạy lại: `npm install`

### Python WASM không load
- Kiểm tra internet connection
- Pyodide cần tải ~10MB lần đầu
- Thử chuyển sang API mode

### HTML không render
- Đảm bảo code HTML hợp lệ
- Kiểm tra console browser (F12)
- Thử refresh page

## 🔥 WebAssembly Features

### Supported Languages
- **JavaScript**: Native browser execution với console capture
- **Python**: Pyodide - Python compiled to WebAssembly
- **HTML/CSS**: Live preview trong iframe sandbox

### Performance
- JavaScript WASM: ~10x nhanh hơn API
- Python WASM: ~5x nhanh hơn API (sau khi load)
- HTML: Instant rendering

### Toggle WASM/API
- Nút toggle trên Terminal header
- WASM: Chạy local (nhanh, offline)
- API: Chạy server (nhiều ngôn ngữ hơn)

## 📄 License

MIT License - Free to use

## 🚀 Deploy lên Vercel

### Bước 1: Chuẩn bị Firebase
1. Tạo project Firebase tại https://console.firebase.google.com
2. Bật **Realtime Database** và **Authentication**
3. Trong Authentication, bật **Email/Password** và **Google Sign-In**
4. Copy Firebase config từ Project Settings

### Bước 2: Cấu hình Firebase trong code
Mở `client/src/firebase.js` và thay thế config:
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

### Bước 3: Push lên GitHub
```bash
# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit - Code Net"

# Thêm remote repository
git remote add origin https://github.com/gaulmt/code-net.git

# Push lên GitHub
git push -u origin main
```

### Bước 4: Deploy lên Vercel
1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **"New Project"**
4. Import repository `code-net`
5. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

### Bước 5: Cấu hình Firebase cho Production
1. Trong Firebase Console, vào **Authentication > Settings**
2. Thêm domain Vercel vào **Authorized domains**:
   - `your-app.vercel.app`
3. Trong **Realtime Database > Rules**, cập nhật:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Bước 6: Hoàn thành! 🎉
- App của bạn đã live tại: `https://your-app.vercel.app`
- Mỗi lần push lên GitHub, Vercel tự động deploy

### Troubleshooting Deploy

**Lỗi: Build failed**
- Kiểm tra `client/package.json` có đúng dependencies
- Chạy `npm run build` local để test

**Lỗi: Firebase not configured**
- Kiểm tra Firebase config trong `firebase.js`
- Đảm bảo đã bật Realtime Database và Authentication

**Lỗi: 404 on refresh**
- File `vercel.json` đã có rewrites rule
- Nếu vẫn lỗi, thêm trong Vercel dashboard: Settings > Rewrites

## 👨‍💻 Author

**Nguyễn Đăng Dương**
- GitHub: [@gaulmt](https://github.com/gaulmt)
- Project: Code Net - Real-time Collaborative Code Editor

---

**Enjoy coding together! 🚀**
