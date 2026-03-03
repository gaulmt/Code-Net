# ⚡ Quick Deploy Guide - Code Net

## 🎯 Deploy trong 10 phút

### Bước 1: Firebase Setup (3 phút)

1. **Tạo Firebase Project**
   - Vào: https://console.firebase.google.com
   - Click "Add project" → Đặt tên → Create

2. **Bật Realtime Database**
   - Realtime Database → Create Database
   - Location: United States
   - Mode: Test mode → Enable

3. **Update Rules**
   - Tab Rules → Copy từ `FIREBASE_RULES_PRODUCTION.json`
   - Paste → Publish

4. **Bật Authentication**
   - Authentication → Get started
   - Enable: Email/Password ✓
   - Enable: Google ✓ (nhập email support)

5. **Lấy Config**
   - Project Settings (⚙️) → Your apps → Web (</> icon)
   - Register app → Copy config
   - Paste vào `client/src/firebase.js` (thay thế config cũ)

### Bước 2: GitHub Push (2 phút)

```bash
# Trong thư mục code_together
git init
git add .
git commit -m "Initial commit - Code Net"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/code-net.git
git push -u origin main
```

**Lưu ý:** Thay `YOUR_USERNAME` bằng username GitHub của bạn

### Bước 3: Vercel Deploy (5 phút)

1. **Login Vercel**
   - Vào: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Add New → Project
   - Import repository "code-net"

3. **Configure**
   - Framework Preset: **Vite**
   - Root Directory: **client**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**

4. **Đợi Deploy** (~2 phút)
   - Vercel build và deploy
   - Nhận link: `https://your-app.vercel.app`

### Bước 4: Final Setup (1 phút)

1. **Add Domain to Firebase**
   - Firebase Console → Authentication → Settings
   - Authorized domains → Add domain
   - Thêm: `your-app.vercel.app`

2. **Test App**
   - Mở link Vercel
   - Test đăng ký/đăng nhập
   - Test tạo project
   - Test messenger

## ✅ Done!

App của bạn đã live tại: `https://your-app.vercel.app`

## 🔄 Update sau này

Mỗi khi có thay đổi:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel tự động deploy lại!

## 🐛 Nếu gặp lỗi

### Build Failed
```bash
cd client
npm install
npm run build
```
Nếu build local OK → Push lại

### Firebase Permission Denied
- Check Firebase Rules đã update chưa
- Check Authorized domains đã add chưa
- Đợi 5-10 phút

### 404 on Refresh
File `vercel.json` đã có sẵn, không cần làm gì

## 📚 Docs đầy đủ

Xem `DEPLOY.md` và `PRE_DEPLOY_CHECKLIST.md` để biết chi tiết

---

**Tác giả:** Nguyễn Đăng Dương
**Facebook:** https://www.facebook.com/share/18Fa25fAke/

**Happy Coding! 🚀**
