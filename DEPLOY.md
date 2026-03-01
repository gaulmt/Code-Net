# 🚀 Hướng dẫn Deploy Code Net lên Vercel

## Checklist trước khi deploy

- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Firebase
- [ ] Đã có tài khoản Vercel
- [ ] Code chạy tốt ở local

## Bước 1: Cấu hình Firebase

### 1.1. Tạo Firebase Project
1. Truy cập https://console.firebase.google.com
2. Click **"Add project"**
3. Đặt tên project: `code-net` (hoặc tên bạn muốn)
4. Tắt Google Analytics (không bắt buộc)
5. Click **"Create project"**

### 1.2. Bật Realtime Database
1. Trong Firebase Console, vào **"Realtime Database"**
2. Click **"Create Database"**
3. Chọn location: **"United States (us-central1)"**
4. Chọn mode: **"Start in test mode"** (tạm thời)
5. Click **"Enable"**

### 1.3. Cấu hình Database Rules
Vào tab **"Rules"** và paste:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    },
    "users": {
      "$userId": {
        ".read": true,
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "usernames": {
      ".read": true,
      ".write": "auth != null"
    },
    "projects": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```
Click **"Publish"**

### 1.4. Bật Authentication
1. Vào **"Authentication"**
2. Click **"Get started"**
3. Bật **"Email/Password"**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. Bật **"Google"**:
   - Click "Google"
   - Toggle "Enable"
   - Nhập email support
   - Click "Save"

### 1.5. Lấy Firebase Config
1. Vào **"Project Settings"** (icon bánh răng)
2. Scroll xuống **"Your apps"**
3. Click icon **"</>"** (Web)
4. Đặt tên app: `code-net-web`
5. Click **"Register app"**
6. Copy đoạn config:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "code-net-xxx.firebaseapp.com",
  databaseURL: "https://code-net-xxx.firebaseio.com",
  projectId: "code-net-xxx",
  storageBucket: "code-net-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 1.6. Cập nhật Firebase Config trong code
Mở file `client/src/firebase.js` và thay thế:
```javascript
const firebaseConfig = {
  // Paste config của bạn vào đây
};
```

## Bước 2: Push lên GitHub

### 2.1. Tạo Repository trên GitHub
1. Truy cập https://github.com/new
2. Đặt tên: `code-net`
3. Chọn **"Public"** hoặc **"Private"**
4. **KHÔNG** tick "Add README" (đã có sẵn)
5. Click **"Create repository"**

### 2.2. Push code lên GitHub

**Trên Windows (CMD):**
```cmd
cd D:\code_together
git init
git add .
git commit -m "Initial commit - Code Net by Nguyen Dang Duong"
git branch -M main
git remote add origin https://github.com/gaulmt/code-net.git
git push -u origin main
```

**Trên Mac/Linux:**
```bash
cd ~/code_together
git init
git add .
git commit -m "Initial commit - Code Net by Nguyen Dang Duong"
git branch -M main
git remote add origin https://github.com/gaulmt/code-net.git
git push -u origin main
```

**Lưu ý:** Thay `gaulmt` bằng username GitHub của bạn

## Bước 3: Deploy lên Vercel

### 3.1. Đăng nhập Vercel
1. Truy cập https://vercel.com
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel

### 3.2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Tìm repository **"code-net"**
3. Click **"Import"**

### 3.3. Cấu hình Deploy
**Framework Preset:** Vite

**Root Directory:** `client`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:** (Không cần nếu đã hardcode trong firebase.js)

Click **"Deploy"**

### 3.4. Đợi Deploy
- Vercel sẽ build và deploy (~2-3 phút)
- Khi xong, bạn sẽ thấy 🎉 và link app

## Bước 4: Cấu hình Firebase cho Production

### 4.1. Thêm Domain vào Firebase
1. Vào Firebase Console → **Authentication** → **Settings**
2. Tab **"Authorized domains"**
3. Click **"Add domain"**
4. Thêm domain Vercel: `your-app.vercel.app`
5. Click **"Add"**

### 4.2. Test App
1. Mở link Vercel: `https://your-app.vercel.app`
2. Test đăng ký/đăng nhập
3. Test tạo project
4. Test code editor

## Bước 5: Custom Domain (Optional)

### 5.1. Mua Domain
- Namecheap, GoDaddy, Google Domains, etc.
- VD: `codenet.dev`

### 5.2. Thêm Domain vào Vercel
1. Trong Vercel project → **Settings** → **Domains**
2. Nhập domain: `codenet.dev`
3. Click **"Add"**
4. Copy DNS records

### 5.3. Cấu hình DNS
1. Vào nhà cung cấp domain
2. Thêm DNS records từ Vercel
3. Đợi DNS propagate (~24h, thường 1-2h)

### 5.4. Cập nhật Firebase
1. Thêm custom domain vào **Authorized domains**
2. Test lại authentication

## Troubleshooting

### Build Failed
**Lỗi:** `npm ERR! code ELIFECYCLE`
- Chạy `npm run build` ở local để test
- Kiểm tra `package.json` có đúng dependencies
- Xóa `node_modules` và `package-lock.json`, chạy lại `npm install`

### Firebase Error
**Lỗi:** `Firebase: Error (auth/unauthorized-domain)`
- Thêm domain Vercel vào Firebase Authorized domains
- Đợi 5-10 phút để Firebase update

**Lỗi:** `Firebase: Error (auth/configuration-not-found)`
- Kiểm tra Firebase config trong `firebase.js`
- Đảm bảo đã bật Authentication methods

### 404 Error on Refresh
**Lỗi:** Refresh page bị 404
- File `vercel.json` đã có rewrites
- Nếu vẫn lỗi, thêm trong Vercel:
  - Settings → Rewrites
  - Source: `/(.*)`
  - Destination: `/index.html`

### CORS Error
**Lỗi:** `Access-Control-Allow-Origin`
- Kiểm tra Firebase Database Rules
- Đảm bảo domain đã được authorize

## Auto Deploy

Mỗi lần push lên GitHub, Vercel tự động deploy:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel sẽ:
1. Detect push
2. Build project
3. Deploy lên production
4. Gửi notification

## Monitoring

### Vercel Dashboard
- **Analytics**: Xem traffic, performance
- **Logs**: Debug errors
- **Deployments**: Xem lịch sử deploy

### Firebase Console
- **Authentication**: Xem users
- **Realtime Database**: Xem data
- **Usage**: Xem quota

## Backup & Rollback

### Rollback về version cũ
1. Vào Vercel → **Deployments**
2. Tìm deployment cũ
3. Click **"..."** → **"Promote to Production"**

### Backup Firebase
1. Vào **Realtime Database**
2. Click **"..."** → **"Export JSON"**
3. Lưu file backup

## Security Checklist

- [ ] Firebase Database Rules đã cấu hình đúng
- [ ] Authentication methods đã bật
- [ ] Authorized domains đã thêm
- [ ] Environment variables không public
- [ ] HTTPS đã bật (Vercel tự động)

## Performance Tips

1. **Enable Vercel Analytics**
   - Settings → Analytics → Enable

2. **Optimize Images**
   - Compress logo và avatars
   - Dùng WebP format

3. **Enable Caching**
   - Vercel tự động cache static assets

4. **Monitor Firebase Usage**
   - Check quota hàng tháng
   - Upgrade plan nếu cần

## Support

Nếu gặp vấn đề:
1. Check Vercel logs
2. Check Firebase logs
3. Check browser console (F12)
4. Google error message
5. Ask on GitHub Issues

---

**Chúc bạn deploy thành công! 🚀**

Dự án của: **Nguyễn Đăng Dương** - [@gaulmt](https://github.com/gaulmt)
