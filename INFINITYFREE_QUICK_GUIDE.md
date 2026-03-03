# ⚡ InfinityFree - Hướng Dẫn Nhanh

## 🎯 Tóm Tắt

InfinityFree chỉ host được **frontend** (static files). Backend phải deploy riêng.

---

## 📋 Checklist 5 Bước

### ✅ Bước 1: Deploy Backend (15 phút)
```
1. Vào https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Add environment variables:
   - GMAIL_USER
   - GMAIL_APP_PASSWORD
5. Copy backend URL: https://your-app.railway.app
```

### ✅ Bước 2: Update Frontend Code (5 phút)
```
Tìm và sửa file gọi API OTP (thường là App.jsx):

TÌM:
fetch('http://localhost:3001/api/send-otp'

THAY:
fetch('https://your-app.railway.app/api/send-otp'
```

### ✅ Bước 3: Build Frontend (5 phút)
```bash
# Chạy script
build-for-infinityfree.bat

# Hoặc manual:
cd client
npm install
npm run build
```

Files build sẽ ở: `client/dist`

### ✅ Bước 4: Upload lên InfinityFree (20 phút)

**A. Chuẩn bị**:
1. Đăng ký InfinityFree: https://infinityfree.net
2. Tạo account mới
3. Lấy thông tin FTP từ Control Panel

**B. Upload**:
1. Download FileZilla: https://filezilla-project.org
2. Kết nối FTP:
   - Host: `ftpupload.net`
   - Username: `epiz_xxxxx` (từ InfinityFree)
   - Password: (từ InfinityFree)
   - Port: `21`
3. Xóa tất cả files trong `htdocs`
4. Upload tất cả files từ `client/dist` vào `htdocs`
5. Upload file `.htaccess` (copy từ `.htaccess.example`)

### ✅ Bước 5: Test (10 phút)
```
1. Truy cập: https://your-subdomain.infinityfreeapp.com
2. Test đăng ký
3. Test OTP
4. Test đăng nhập
5. Test tạo project
```

---

## 📁 Files Cần Upload

Từ `client/dist` upload vào `htdocs`:
```
htdocs/
├── index.html          ← Main file
├── assets/             ← JS, CSS files
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
├── logo.jpg            ← Public files
├── *.png
└── .htaccess           ← QUAN TRỌNG! (copy từ .htaccess.example)
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. File .htaccess
**BẮT BUỘC** phải có file này để React Router hoạt động!

Copy từ `.htaccess.example` và upload vào `htdocs`.

### 2. Backend Riêng
InfinityFree **KHÔNG** chạy được Node.js backend.
→ Phải deploy backend lên Railway/Render

### 3. Real-time Sync
InfinityFree không hỗ trợ WebSocket tốt.
→ Real-time sync có thể chậm hoặc không hoạt động

### 4. CORS
Nhớ update CORS trong `server.js`:
```javascript
app.use(cors({
  origin: ['https://your-subdomain.infinityfreeapp.com']
}));
```

---

## 🐛 Troubleshooting

### Lỗi: 404 khi refresh page
→ File `.htaccess` chưa upload hoặc sai cấu hình

### Lỗi: CORS error
→ Chưa update CORS trong backend

### Lỗi: OTP không gửi
→ Backend Railway chưa chạy hoặc URL sai

### Site load chậm
→ InfinityFree free tier chậm, bình thường

---

## 💡 Tips

1. **Dùng FileZilla** - Dễ upload hơn File Manager
2. **Check .htaccess** - File này rất quan trọng
3. **Test local trước** - `npm run preview` trước khi upload
4. **Backup files** - Trước khi upload lần mới

---

## 🎯 Alternative: Vercel (Khuyên Dùng)

Nếu gặp khó khăn, dùng Vercel thay thế:

```bash
npm install -g vercel
cd client
vercel --prod
```

**Lợi ích**:
- ✅ Dễ hơn 10 lần
- ✅ Nhanh hơn
- ✅ Ổn định hơn
- ✅ HTTPS miễn phí
- ✅ Auto deploy

---

## 📚 Tài Liệu Đầy Đủ

- **`DEPLOY_INFINITYFREE.md`** - Hướng dẫn chi tiết
- **`.htaccess.example`** - File .htaccess mẫu
- **`build-for-infinityfree.bat`** - Script build

---

## ⏱️ Tổng Thời Gian

- Deploy backend: 15 phút
- Update code: 5 phút
- Build: 5 phút
- Upload FTP: 20 phút
- Test: 10 phút

**Tổng**: ~1 giờ

---

## 📞 Cần Giúp?

- **Full Guide**: `DEPLOY_INFINITYFREE.md`
- **InfinityFree Forum**: https://forum.infinityfree.net
- **Railway Docs**: https://docs.railway.app

---

**Khuyên dùng Vercel nếu có thể - Dễ hơn nhiều!** 🚀
