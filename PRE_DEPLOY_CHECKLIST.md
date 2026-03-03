# 🚀 Pre-Deploy Checklist - Code Net

## ✅ Checklist hoàn thành trước khi deploy

### 1. Code Quality
- [x] Tất cả components không có lỗi syntax
- [x] Không có unused imports/variables
- [x] Console.log debug đã được xóa hoặc comment (giữ lại logs quan trọng)
- [x] Code đã được format đẹp

### 2. Features hoàn thành
- [x] Real-time collaboration editor
- [x] Interactive Terminal (C/C++, Python, JavaScript, Java)
- [x] File & Folder Management (drag & drop)
- [x] Project Management (create, join, save, delete)
- [x] User Authentication (Email/Password, Google)
- [x] User Profile & Avatar
- [x] Team Management (5 roles: Leader, Developer, Designer, Member, Viewer)
- [x] Toast Notifications
- [x] Confirm Dialog
- [x] Messenger (1-1 chat, real-time)
- [x] Online Status
- [x] Project Name Display

### 3. Firebase Configuration
- [ ] Firebase project đã tạo
- [ ] Realtime Database đã bật
- [ ] Authentication methods đã bật (Email/Password, Google)
- [ ] Firebase config trong `client/src/firebase.js` đã cập nhật
- [ ] Firebase Rules đã cập nhật (dùng `FIREBASE_RULES_PRODUCTION.json`)
- [ ] Authorized domains đã thêm (localhost, vercel domain)

### 4. Build & Test
- [ ] `npm install` trong thư mục `client/` chạy thành công
- [ ] `npm run build` trong thư mục `client/` chạy thành công
- [ ] Test app ở local với `npm run preview`
- [ ] Test tất cả features chính:
  - [ ] Đăng ký/Đăng nhập
  - [ ] Tạo project
  - [ ] Join project
  - [ ] Code editor real-time
  - [ ] Run code (Terminal)
  - [ ] File management
  - [ ] Messenger
  - [ ] Profile

### 5. Git & GitHub
- [ ] Git repository đã init
- [ ] `.gitignore` đã có (node_modules, dist, .env)
- [ ] Code đã commit
- [ ] GitHub repository đã tạo
- [ ] Code đã push lên GitHub

### 6. Vercel Configuration
- [ ] Vercel account đã tạo
- [ ] GitHub đã connect với Vercel
- [ ] Root Directory: `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Framework Preset: Vite

### 7. Environment Variables (Optional)
Nếu dùng .env thay vì hardcode:
- [ ] `.env` file đã tạo trong `client/`
- [ ] Environment variables đã set trong Vercel
- [ ] `firebase.js` đã dùng `import.meta.env.VITE_*`

### 8. Assets & Resources
- [x] Logo images có trong `client/public/`
- [x] Language logos có trong `client/public/`
- [x] Avatar images có trong `client/public/`
- [x] Favicon đã set

### 9. Security
- [ ] Firebase API key không bị expose (OK nếu public, Firebase có domain restrictions)
- [ ] Firebase Rules đã restrict write permissions
- [ ] Không có sensitive data trong code
- [ ] HTTPS đã bật (Vercel tự động)

### 10. Performance
- [x] Images đã optimize (compress nếu cần)
- [x] Code splitting (Vite tự động)
- [x] Lazy loading components (nếu cần)
- [x] Monaco Editor loaded on demand

### 11. Documentation
- [x] README.md đã update
- [x] DEPLOY.md có hướng dẫn chi tiết
- [x] CHANGELOG.md đã update
- [x] Feature docs đã tạo (MESSENGER_FEATURE.md, etc.)

### 12. Final Checks
- [ ] Package.json version đã update
- [ ] License đã chọn (MIT)
- [ ] Author info đã điền
- [ ] Repository URL đã update

## 📋 Commands để chạy

### Local Development
```bash
cd client
npm install
npm run dev
```

### Build for Production
```bash
cd client
npm run build
npm run preview
```

### Deploy to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# Vercel sẽ tự động deploy
```

## 🔥 Firebase Rules Update

Copy nội dung từ `FIREBASE_RULES_PRODUCTION.json` và paste vào Firebase Console:
1. https://console.firebase.google.com
2. Chọn project
3. Realtime Database → Rules
4. Paste rules
5. Publish

## 🌐 Vercel Deploy Settings

**Framework Preset:** Vite

**Root Directory:** `client`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:** (Nếu dùng .env)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## ✨ Post-Deploy Checklist

Sau khi deploy thành công:
- [ ] Test app trên production URL
- [ ] Test authentication
- [ ] Test real-time features
- [ ] Test messenger
- [ ] Check Firebase usage/quota
- [ ] Monitor Vercel analytics
- [ ] Share link với team/friends

## 🐛 Troubleshooting

### Build Failed
```bash
# Clear cache và rebuild
cd client
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Firebase Permission Denied
- Check Firebase Rules
- Check Authorized Domains
- Wait 5-10 minutes for propagation

### 404 on Refresh
- Check `vercel.json` có rewrites
- Vercel Settings → Rewrites

### CORS Error
- Check Firebase Authorized Domains
- Check Vercel domain đã add vào Firebase

## 📞 Support

Nếu gặp vấn đề:
1. Check Vercel deployment logs
2. Check Firebase Console logs
3. Check browser console (F12)
4. Đọc DEPLOY.md
5. Google error message

---

**Tác giả:** Nguyễn Đăng Dương
**Facebook:** https://www.facebook.com/share/18Fa25fAke/
**Project:** Code Net - Real-time Collaborative Code Editor

**Chúc bạn deploy thành công! 🎉**
