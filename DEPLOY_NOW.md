# 🚀 DEPLOY NGAY - Hướng Dẫn Nhanh

## Bước 1: Chuẩn Bị (5 phút)

### A. Kiểm tra file .env

**Backend (.env trong root folder)**:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
PORT=3001
```

**Frontend (client/.env)**:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_url
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### B. Upload Firebase Rules

1. Mở Firebase Console
2. Vào Realtime Database → Rules
3. Copy nội dung từ `FIREBASE_RULES_PRODUCTION.json`
4. Paste và click **Publish**

---

## Bước 2: Deploy Frontend (10 phút)

### Cách 1: Vercel (Khuyên dùng)

```bash
# Cài Vercel CLI (nếu chưa có)
npm install -g vercel

# Login
vercel login

# Deploy
cd client
vercel --prod
```

**Sau khi deploy**:
1. Vào Vercel Dashboard
2. Settings → Environment Variables
3. Thêm tất cả biến từ `client/.env`
4. Redeploy

### Cách 2: Netlify

```bash
# Cài Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd client
netlify deploy --prod
```

**Sau khi deploy**:
1. Vào Netlify Dashboard
2. Site Settings → Environment Variables
3. Thêm tất cả biến từ `client/.env`
4. Redeploy

### Cách 3: Dùng Script (Windows)

```bash
# Chạy file deploy.bat
deploy.bat

# Chọn option 1 (Vercel) hoặc 2 (Netlify)
```

---

## Bước 3: Deploy Backend (10 phút)

### Option A: Railway (Khuyên dùng)

1. **Tạo tài khoản**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Connect repo** của bạn
4. **Add variables**:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
5. **Deploy** (tự động)
6. **Copy URL** backend (VD: `https://your-app.railway.app`)

### Option B: Render

1. **Tạo tài khoản**: https://render.com
2. **New** → **Web Service**
3. **Connect repo**
4. **Settings**:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. **Environment Variables**:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
6. **Create Web Service**
7. **Copy URL** backend

### Option C: Vercel Serverless (Nâng cao)

Tạo `api/send-otp.js` và deploy cùng frontend.

---

## Bước 4: Kết Nối Frontend với Backend (5 phút)

### Tìm và sửa file gọi API OTP

**File**: `client/src/App.jsx` (hoặc component xử lý OTP)

**Tìm dòng**:
```javascript
const response = await fetch('http://localhost:3001/api/send-otp', {
```

**Thay bằng**:
```javascript
const response = await fetch('https://your-backend-url.railway.app/api/send-otp', {
```

**Lưu và redeploy frontend**:
```bash
cd client
vercel --prod
# hoặc
netlify deploy --prod
```

---

## Bước 5: Test Production (10 phút)

### Checklist Test:

1. **Mở site production**
2. **Test đăng ký**:
   - [ ] Nhập email, password
   - [ ] Nhận OTP qua email
   - [ ] Xác minh OTP thành công
3. **Test đăng nhập**:
   - [ ] Login với tài khoản vừa tạo
   - [ ] Google Sign-In (nếu có)
4. **Test tạo project**:
   - [ ] Tạo project mới
   - [ ] Tạo file
   - [ ] Edit code
   - [ ] Sync code
5. **Test download**:
   - [ ] Download file đơn
   - [ ] Download ZIP
6. **Test invite**:
   - [ ] Invite member
   - [ ] Set permissions
7. **Test friend system**:
   - [ ] Add friend
   - [ ] Accept request
   - [ ] Notifications

---

## Bước 6: Cấu Hình Domain (Optional - 15 phút)

### Vercel:
1. Project Settings → Domains
2. Add your domain
3. Update DNS records theo hướng dẫn

### Netlify:
1. Site Settings → Domain Management
2. Add custom domain
3. Update DNS records

---

## 🎉 Hoàn Tất!

### URLs của bạn:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app
- **Custom Domain**: https://your-domain.com (nếu có)

### Bước tiếp theo:
1. ✅ Share link với team/users
2. ✅ Monitor logs và errors
3. ✅ Setup analytics (Google Analytics)
4. ✅ Setup monitoring (UptimeRobot)
5. ✅ Backup Firebase data định kỳ

---

## 🐛 Troubleshooting Nhanh

### Lỗi: "Firebase not initialized"
→ Kiểm tra environment variables trong Vercel/Netlify dashboard

### Lỗi: "CORS error"
→ Thêm frontend URL vào CORS whitelist trong `server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app']
}));
```

### Lỗi: "OTP not sending"
→ Kiểm tra:
1. Gmail App Password đúng chưa
2. Backend URL đã update chưa
3. Backend có running không (check Railway/Render dashboard)

### Lỗi: Build failed
→ Chạy local:
```bash
cd client
rm -rf node_modules
npm install
npm run build
```

---

## 📞 Support

- **Firebase**: https://firebase.google.com/support
- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/help
- **Netlify**: https://www.netlify.com/support

---

## 📚 Tài Liệu Chi Tiết

- `PRODUCTION_DEPLOY_GUIDE.md` - Hướng dẫn đầy đủ
- `PRODUCTION_CHECKLIST.md` - Checklist chi tiết
- `DEPLOY.md` - Hướng dẫn deploy cũ

---

**Tổng thời gian**: ~40 phút
**Độ khó**: ⭐⭐⭐ (Trung bình)
**Chi phí**: Free tier (Vercel + Railway + Firebase)

**Good luck! 🚀**
