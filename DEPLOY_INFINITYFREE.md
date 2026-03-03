# 🚀 Deploy Code Net lên InfinityFree

## ⚠️ Lưu Ý Quan Trọng

InfinityFree là free hosting với một số giới hạn:
- ❌ **Không hỗ trợ Node.js backend** (server.js không chạy được)
- ✅ Chỉ hỗ trợ static files (HTML, CSS, JS)
- ✅ Có thể host React build (client/dist)
- ❌ Không có WebSocket support
- ⚠️ Có giới hạn CPU và bandwidth

**Giải pháp**: Deploy frontend lên InfinityFree, backend lên Railway/Render (free)

---

## 📋 Chuẩn Bị

### 1. Tài Khoản InfinityFree
- Đăng ký tại: https://infinityfree.net
- Tạo account mới
- Lưu thông tin FTP

### 2. Backend Riêng (Bắt Buộc)
Backend phải deploy riêng vì InfinityFree không hỗ trợ Node.js:
- **Railway** (khuyên dùng): https://railway.app
- **Render**: https://render.com
- **Glitch**: https://glitch.com

---

## 🔧 Bước 1: Deploy Backend (Railway)

### A. Tạo Tài Khoản Railway
1. Vào https://railway.app
2. Sign up with GitHub
3. Verify email

### B. Deploy Backend
1. **New Project** → **Deploy from GitHub repo**
2. Connect GitHub repo của bạn
3. Railway sẽ tự detect Node.js

### C. Thêm Environment Variables
Trong Railway dashboard:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
PORT=3001
```

### D. Lấy Backend URL
- Railway sẽ generate URL: `https://your-app.railway.app`
- Copy URL này để dùng ở bước sau

---

## 🔧 Bước 2: Cấu Hình Frontend

### A. Update Backend URL

**File cần sửa**: Tìm nơi gọi API OTP trong code

Thường ở `client/src/App.jsx` hoặc component xử lý signup:

```javascript
// TÌM dòng này:
const response = await fetch('http://localhost:3001/api/send-otp', {

// THAY BẰNG:
const response = await fetch('https://your-app.railway.app/api/send-otp', {
```

### B. Update CORS trong Backend

**File**: `server.js`

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-infinityfree-domain.infinityfreeapp.com',
    'http://your-custom-domain.com' // nếu có
  ],
  credentials: true
}));
```

### C. Build Frontend

```bash
cd client
npm install
npm run build
```

Folder `client/dist` sẽ chứa files cần upload.

---

## 🔧 Bước 3: Upload lên InfinityFree

### Option A: FTP Upload (Khuyên dùng)

#### 1. Download FTP Client
- **FileZilla**: https://filezilla-project.org/download.php?type=client
- Hoặc **WinSCP** (Windows): https://winscp.net

#### 2. Kết Nối FTP
Trong InfinityFree Control Panel:
- Vào **FTP Details**
- Copy thông tin:
  - FTP Hostname: `ftpupload.net`
  - FTP Username: `epiz_xxxxx`
  - FTP Password: `your_password`

Trong FileZilla:
- Host: `ftpupload.net`
- Username: `epiz_xxxxx`
- Password: `your_password`
- Port: `21`
- Click **Quickconnect**

#### 3. Upload Files
1. Trong FileZilla, navigate đến folder `htdocs` (bên phải)
2. Xóa tất cả files mặc định trong `htdocs`
3. Upload tất cả files từ `client/dist` vào `htdocs`

**Cấu trúc sau khi upload**:
```
htdocs/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── ...
└── logo.jpg (và các files public khác)
```

### Option B: File Manager (Chậm hơn)

1. Vào InfinityFree Control Panel
2. Click **Online File Manager**
3. Navigate đến `htdocs`
4. Upload từng file từ `client/dist`

---

## 🔧 Bước 4: Cấu Hình .htaccess (Quan Trọng!)

InfinityFree cần `.htaccess` để SPA routing hoạt động.

**Tạo file `.htaccess`** trong `htdocs`:

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect all requests to index.html for SPA routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**Upload file `.htaccess`** vào `htdocs` qua FTP.

---

## 🔧 Bước 5: Cấu Hình Environment Variables

InfinityFree không hỗ trợ environment variables như Vercel. Bạn cần:

### Option A: Build với Environment Variables

Trước khi build, set environment variables:

**Windows (PowerShell)**:
```powershell
$env:VITE_FIREBASE_API_KEY="your_key"
$env:VITE_FIREBASE_AUTH_DOMAIN="your_domain"
# ... set tất cả các biến

cd client
npm run build
```

**Linux/Mac**:
```bash
export VITE_FIREBASE_API_KEY="your_key"
export VITE_FIREBASE_AUTH_DOMAIN="your_domain"
# ... set tất cả các biến

cd client
npm run build
```

### Option B: Hardcode (Không khuyên dùng cho production)

Tạo file `client/src/config.js`:
```javascript
export const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_domain",
  databaseURL: "your_url",
  projectId: "your_project_id",
  storageBucket: "your_bucket",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

Update `client/src/firebase.js` để import từ config.js.

---

## 🧪 Bước 6: Test Production

### 1. Truy Cập Site
URL của bạn: `https://your-subdomain.infinityfreeapp.com`

### 2. Test Features
- [ ] Homepage load
- [ ] Đăng ký tài khoản
- [ ] Nhận OTP (check backend Railway)
- [ ] Xác minh OTP
- [ ] Đăng nhập
- [ ] Tạo project
- [ ] Edit code
- [ ] Sync code (có thể bị giới hạn do không có WebSocket)

### 3. Check Console
- Mở DevTools (F12)
- Check Console tab
- Không có lỗi CORS
- Không có lỗi 404

---

## ⚠️ Giới Hạn InfinityFree

### 1. Real-time Sync Có Thể Không Hoạt Động
- InfinityFree không hỗ trợ WebSocket
- Firebase Realtime Database có thể bị giới hạn
- **Giải pháp**: Dùng Firebase polling thay vì WebSocket

### 2. CPU Limits
- InfinityFree giới hạn CPU usage
- Site có thể bị suspend nếu vượt quá
- **Giải pháp**: Optimize code, reduce requests

### 3. Bandwidth Limits
- Free tier có giới hạn bandwidth
- **Giải pháp**: Optimize images, enable compression

### 4. No HTTPS on Free Subdomain
- HTTPS chỉ có với custom domain
- **Giải pháp**: Upgrade hoặc dùng custom domain

---

## 🔧 Troubleshooting

### Lỗi: "404 Not Found" khi refresh
→ Check file `.htaccess` đã upload chưa

### Lỗi: "CORS error"
→ Update CORS origin trong `server.js` với InfinityFree URL

### Lỗi: "Firebase not initialized"
→ Check environment variables trong build

### Lỗi: "OTP not sending"
→ Check Railway backend có running không

### Site bị suspend
→ Vượt quá CPU limit, cần optimize hoặc upgrade

---

## 💡 Khuyến Nghị

### Nếu Muốn Free Hosting Tốt Hơn:

1. **Vercel** (Khuyên dùng nhất):
   - ✅ Free tier tốt
   - ✅ HTTPS miễn phí
   - ✅ Auto deploy from GitHub
   - ✅ Fast CDN
   - ✅ No CPU limits

2. **Netlify**:
   - ✅ Tương tự Vercel
   - ✅ Free tier tốt
   - ✅ Easy setup

3. **GitHub Pages**:
   - ✅ Free
   - ✅ HTTPS
   - ❌ Chỉ static sites

### Nếu Vẫn Muốn Dùng InfinityFree:
- ✅ OK cho testing
- ✅ OK cho portfolio nhỏ
- ❌ Không khuyên cho production app
- ❌ Không khuyên cho real-time features

---

## 📋 Checklist Deploy InfinityFree

- [ ] Deploy backend lên Railway
- [ ] Lấy backend URL
- [ ] Update backend URL trong frontend code
- [ ] Update CORS trong backend
- [ ] Build frontend: `cd client && npm run build`
- [ ] Upload `client/dist` lên InfinityFree `htdocs`
- [ ] Upload file `.htaccess`
- [ ] Test site
- [ ] Test OTP
- [ ] Test all features

---

## 🎯 Alternative: Deploy Toàn Bộ lên Vercel

Nếu gặp khó khăn với InfinityFree, khuyên dùng Vercel:

```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

**Lợi ích**:
- ✅ Dễ hơn nhiều
- ✅ Nhanh hơn
- ✅ Ổn định hơn
- ✅ HTTPS miễn phí
- ✅ Auto deploy

---

## 📞 Support

- **InfinityFree Forum**: https://forum.infinityfree.net
- **Railway Docs**: https://docs.railway.app
- **Firebase Docs**: https://firebase.google.com/docs

---

**Tổng thời gian**: 1-2 giờ (do upload FTP chậm)
**Độ khó**: ⭐⭐⭐⭐ (Khó hơn Vercel)
**Chi phí**: Free

**Lưu ý**: InfinityFree có nhiều giới hạn. Nếu có thể, khuyên dùng Vercel thay thế!
