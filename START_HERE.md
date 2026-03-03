# 🚀 START HERE - Deploy Code Net

## ✅ Dự án đã sẵn sàng deploy!

### 📋 Bạn cần làm gì tiếp theo?

## Bước 1: Đọc hướng dẫn deploy

Chọn một trong hai:

### 🏃 Deploy nhanh (10 phút)
👉 Đọc file: **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**

### 📚 Deploy chi tiết (đầy đủ)
👉 Đọc file: **[DEPLOY.md](DEPLOY.md)**

## Bước 2: Chuẩn bị

### Cần có:
- [ ] Tài khoản Firebase (free)
- [ ] Tài khoản GitHub (free)
- [ ] Tài khoản Vercel (free)

### Tạo tài khoản:
1. Firebase: https://console.firebase.google.com
2. GitHub: https://github.com/signup
3. Vercel: https://vercel.com/signup

## Bước 3: Firebase Setup

1. Tạo Firebase project
2. Bật Realtime Database
3. Bật Authentication (Email + Google)
4. Copy config vào `client/src/firebase.js`
5. Update rules từ `FIREBASE_RULES_PRODUCTION.json`

**Chi tiết:** Xem QUICK_DEPLOY.md

## Bước 4: Push lên GitHub

```bash
git init
git add .
git commit -m "Initial commit - Code Net"
git remote add origin https://github.com/YOUR_USERNAME/code-net.git
git push -u origin main
```

**Lưu ý:** Thay `YOUR_USERNAME` bằng username GitHub của bạn

## Bước 5: Deploy lên Vercel

1. Login Vercel với GitHub
2. Import repository
3. Configure:
   - Root Directory: `client`
   - Framework: Vite
4. Deploy!

**Chi tiết:** Xem QUICK_DEPLOY.md

## Bước 6: Test

1. Mở link Vercel
2. Test đăng ký/đăng nhập
3. Test tạo project
4. Test messenger
5. Done! 🎉

## 📚 Tài liệu đầy đủ

- **README.md** - Tổng quan dự án
- **QUICK_DEPLOY.md** - Hướng dẫn deploy nhanh
- **DEPLOY.md** - Hướng dẫn deploy chi tiết
- **PRE_DEPLOY_CHECKLIST.md** - Checklist trước deploy
- **PRODUCTION_READY.md** - Xác nhận sẵn sàng
- **FEATURES_COMPLETE.md** - Danh sách tính năng
- **FIREBASE_RULES_PRODUCTION.json** - Firebase rules

## 🐛 Gặp vấn đề?

### Build failed?
```bash
cd client
npm install
npm run build
```

### Firebase error?
- Check config trong `client/src/firebase.js`
- Check rules đã update chưa
- Check authorized domains

### Vercel error?
- Check build logs
- Check root directory = `client`
- Check framework = Vite

## 💡 Tips

1. **Đọc QUICK_DEPLOY.md trước** - Nhanh nhất
2. **Làm theo từng bước** - Không bỏ qua
3. **Test local trước** - `npm run build`
4. **Backup Firebase config** - Lưu lại
5. **Check logs** - Nếu có lỗi

## 🎯 Mục tiêu

Deploy thành công trong **10 phút**!

## 📞 Cần giúp?

- Đọc DEPLOY.md
- Check console logs (F12)
- Google error message
- Ask on GitHub Issues

---

## 🚀 Bắt đầu ngay!

👉 Mở file **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** và làm theo hướng dẫn

**Good luck! 🎉**

---

**Project:** Code Net - Real-time Collaborative Code Editor
**Author:** Nguyễn Đăng Dương
**Facebook:** https://www.facebook.com/share/18Fa25fAke/
