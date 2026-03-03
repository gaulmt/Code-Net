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


## 👨‍💻 Author

**Nguyễn Đăng Dương**
- GitHub: [@gaulmt](https://github.com/gaulmt)
- Project: Code Net - Real-time Collaborative Code Editor

---

**Enjoy coding together! 🚀**
