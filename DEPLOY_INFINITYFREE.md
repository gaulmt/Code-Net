# 🌐 Deploy lên InfinityFree Hosting

## ⚠️ Lưu ý quan trọng

InfinityFree là hosting PHP/HTML tĩnh, **KHÔNG** hỗ trợ Node.js/React trực tiếp.

Bạn cần **build** project thành static files trước, rồi upload.

---

## 📦 Bước 1: Build project

### Trên máy local:

```bash
# Vào thư mục client
cd client

# Install dependencies (nếu chưa)
npm install

# Build project
npm run build
```

Sau khi build xong, bạn sẽ có folder `client/dist/` chứa static files.

---

## 📁 Bước 2: Chuẩn bị files upload

### Files cần upload (trong folder `client/dist/`):
```
dist/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── (các file khác)
```

### ⚠️ Vấn đề với InfinityFree:

1. **File size limit**: 10MB/file
2. **Upload limit**: Chậm, dễ timeout
3. **No Node.js**: Không chạy được server-side
4. **No rewrites**: React Router sẽ bị lỗi 404

---

## 🚀 Bước 3: Upload lên InfinityFree

### Cách 1: File Manager (Không khuyến khích)

1. Login vào InfinityFree control panel
2. Vào File Manager
3. Vào folder `htdocs/`
4. Upload tất cả files từ `client/dist/`
5. Đợi upload xong (có thể lâu)

### Cách 2: FTP (Khuyến khích hơn)

1. Download FileZilla: https://filezilla-project.org/
2. Lấy FTP credentials từ InfinityFree
3. Connect qua FTP
4. Upload folder `dist/` vào `htdocs/`

---

## 🔧 Bước 4: Cấu hình .htaccess

Tạo file `.htaccess` trong `htdocs/`:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Compress files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## ⚠️ Vấn đề sẽ gặp với InfinityFree

### 1. File size quá lớn
**Lỗi:** "File too large"

**Giải pháp:**
- File `index.js` của bạn là 702KB (gzipped 165KB)
- InfinityFree limit 10MB → OK
- Nhưng upload có thể timeout

### 2. Upload timeout
**Lỗi:** "Upload failed: Unexpected token..."

**Giải pháp:**
- Upload từng file nhỏ
- Dùng FTP thay vì File Manager
- Upload vào lúc ít người dùng (đêm)

### 3. React Router không hoạt động
**Lỗi:** 404 khi refresh page

**Giải pháp:**
- Dùng `.htaccess` như trên
- Hoặc dùng Hash Router thay vì Browser Router

### 4. Firebase không hoạt động
**Lỗi:** CORS, Authentication errors

**Giải pháp:**
- Add domain InfinityFree vào Firebase Authorized domains
- VD: `yoursite.infinityfreeapp.com`

---

## 🎯 Khuyến nghị: KHÔNG nên dùng InfinityFree

### Lý do:

1. **Quá chậm** - Upload timeout liên tục
2. **Không ổn định** - Down thường xuyên
3. **Giới hạn nhiều** - Bandwidth, file size, CPU
4. **Không hỗ trợ** - Không có support tốt
5. **Ads bắt buộc** - Free plan có ads

### Nên dùng:

1. **Vercel** ⭐⭐⭐⭐⭐
   - Free, unlimited bandwidth
   - Auto deploy từ GitHub
   - Hỗ trợ React/Vite native
   - SSL miễn phí
   - Deploy trong 5 phút

2. **Netlify** ⭐⭐⭐⭐
   - Tương tự Vercel
   - Drag & drop build folder
   - Free tier tốt

3. **Firebase Hosting** ⭐⭐⭐⭐
   - Cùng ecosystem
   - Tích hợp tốt với Firebase
   - Free tier 10GB/month

---

## 🚀 Hướng dẫn deploy lên Vercel (5 phút)

### Bước 1: Push lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/code-net.git
git push -u origin main
```

### Bước 2: Deploy lên Vercel

1. Vào: https://vercel.com
2. Sign up with GitHub
3. Import repository
4. Configure:
   - Root Directory: `client`
   - Framework: Vite
5. Deploy!

### Bước 3: Done!

App của bạn sẽ live tại: `https://your-app.vercel.app`

**Chi tiết:** Xem file `QUICK_DEPLOY.md`

---

## 📊 So sánh

| Feature | InfinityFree | Vercel |
|---------|-------------|--------|
| React Support | ❌ (phải build) | ✅ Native |
| Deploy Speed | 🐌 Chậm | ⚡ Nhanh |
| Bandwidth | 🔴 Giới hạn | ✅ Unlimited |
| SSL | ⚠️ Shared | ✅ Free |
| Uptime | ⚠️ 95% | ✅ 99.9% |
| Support | ❌ Không | ✅ Tốt |
| Ads | ⚠️ Có | ✅ Không |
| Price | Free | Free |

---

## 🔧 Nếu vẫn muốn dùng InfinityFree

### Checklist:

1. Build project: `npm run build`
2. Zip folder `dist/`
3. Upload qua FTP (không dùng File Manager)
4. Tạo file `.htaccess`
5. Add domain vào Firebase Authorized domains
6. Test và cầu nguyện 🙏

### Lưu ý:

- Upload có thể mất 30-60 phút
- Có thể phải upload lại nhiều lần
- App có thể chạy chậm
- Có thể bị down bất cứ lúc nào

---

## ✅ Kết luận

**Khuyến nghị mạnh:** Dùng Vercel thay vì InfinityFree

**Lý do:**
- Deploy nhanh hơn (5 phút vs 1 giờ)
- Ổn định hơn (99.9% vs 95%)
- Không giới hạn bandwidth
- Auto deploy từ GitHub
- Free SSL
- Không có ads

**Hướng dẫn deploy Vercel:** Xem `QUICK_DEPLOY.md`

---

**Author:** Nguyễn Đăng Dương
**Facebook:** https://www.facebook.com/share/18Fa25fAke/

**Seriously, dùng Vercel đi! 🚀**
