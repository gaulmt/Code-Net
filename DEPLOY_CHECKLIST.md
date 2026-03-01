# ✅ Checklist Deploy Code Net lên GitHub & Vercel

## 📋 Chuẩn bị

- [ ] Đã cài Node.js 16+
- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Firebase
- [ ] Đã có tài khoản Vercel
- [ ] Code chạy tốt ở local (`npm run dev`)

## 🔥 Firebase Setup

### Tạo Project
- [ ] Truy cập https://console.firebase.google.com
- [ ] Tạo project mới tên `code-net`
- [ ] Tắt Google Analytics

### Realtime Database
- [ ] Bật Realtime Database
- [ ] Chọn location: US Central
- [ ] Start in test mode
- [ ] Copy Database URL

### Database Rules
- [ ] Vào tab Rules
- [ ] Paste rules từ file `DEPLOY.md`
- [ ] Click Publish

### Authentication
- [ ] Bật Email/Password
- [ ] Bật Google Sign-In
- [ ] Nhập support email

### Firebase Config
- [ ] Vào Project Settings
- [ ] Tạo Web App
- [ ] Copy firebaseConfig
- [ ] Paste vào `client/src/firebase.js`

## 📦 Chuẩn bị Code

### Kiểm tra Files
- [ ] File `vercel.json` đã có
- [ ] File `.gitignore` đã có
- [ ] File `client/.env.example` đã có
- [ ] Firebase config đã cập nhật trong `firebase.js`

### Test Local
```bash
cd client
npm install
npm run build
```
- [ ] Build thành công
- [ ] Không có errors

## 🐙 GitHub Setup

### Tạo Repository
- [ ] Truy cập https://github.com/new
- [ ] Tên repo: `code-net`
- [ ] Chọn Public hoặc Private
- [ ] KHÔNG tick "Add README"
- [ ] Click Create

### Push Code
```bash
cd D:\code_together
git init
git add .
git commit -m "Initial commit - Code Net by Nguyen Dang Duong"
git branch -M main
git remote add origin https://github.com/gaulmt/code-net.git
git push -u origin main
```
- [ ] Push thành công
- [ ] Code đã lên GitHub

## 🚀 Vercel Deploy

### Import Project
- [ ] Truy cập https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Import `code-net` repo

### Configure
- [ ] Framework: Vite
- [ ] Root Directory: `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Click Deploy

### Wait
- [ ] Đợi build (~2-3 phút)
- [ ] Deploy thành công
- [ ] Copy link app

## 🔧 Post-Deploy

### Firebase Config
- [ ] Vào Firebase Authentication > Settings
- [ ] Tab "Authorized domains"
- [ ] Add domain: `your-app.vercel.app`
- [ ] Click Add

### Test App
- [ ] Mở link Vercel
- [ ] Test đăng ký
- [ ] Test đăng nhập Google
- [ ] Test tạo project
- [ ] Test code editor
- [ ] Test chạy code

## 🎉 Hoàn thành!

App của bạn đã live tại: `https://your-app.vercel.app`

### Auto Deploy
Mỗi lần push lên GitHub:
```bash
git add .
git commit -m "Update features"
git push
```
Vercel tự động deploy!

## 📚 Tài liệu

- [README.md](README.md) - Hướng dẫn sử dụng
- [DEPLOY.md](DEPLOY.md) - Hướng dẫn deploy chi tiết
- [CHANGELOG.md](CHANGELOG.md) - Lịch sử thay đổi
- [CONTRIBUTING.md](CONTRIBUTING.md) - Hướng dẫn đóng góp

## 🆘 Troubleshooting

### Build Failed
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Error
- Check Firebase config
- Check Authorized domains
- Wait 5-10 minutes

### 404 on Refresh
- Check `vercel.json` có rewrites
- Add rewrite rule trong Vercel Settings

## 📞 Support

Nếu gặp vấn đề:
1. Đọc [DEPLOY.md](DEPLOY.md)
2. Check Vercel logs
3. Check Firebase logs
4. Check browser console (F12)
5. Open GitHub Issue

---

**Chúc bạn deploy thành công! 🚀**

Dự án của: **Nguyễn Đăng Dương** - [@gaulmt](https://github.com/gaulmt)
