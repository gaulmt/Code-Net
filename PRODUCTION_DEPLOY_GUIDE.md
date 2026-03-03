# 🚀 Hướng Dẫn Deploy Production - Code Net

## ✅ Checklist Trước Khi Deploy

### 1. Kiểm Tra Code
- [x] Tất cả features hoạt động bình thường
- [x] Không có lỗi trong console
- [x] ZIP download hoạt động
- [x] Sync system hoạt động
- [x] File locking hoạt động
- [x] Notification system hoạt động
- [x] Friend system hoạt động
- [x] OTP verification hoạt động

### 2. Environment Variables

#### Backend (.env trong root folder)
```env
# Gmail SMTP cho OTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Port (optional)
PORT=3001
```

#### Frontend (client/.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Setup

#### A. Firebase Rules
Upload file `FIREBASE_RULES_PRODUCTION.json` lên Firebase Realtime Database Rules:

1. Vào Firebase Console
2. Chọn project của bạn
3. Vào **Realtime Database** → **Rules**
4. Copy nội dung từ `FIREBASE_RULES_PRODUCTION.json`
5. Click **Publish**

#### B. Firebase Authentication
Đảm bảo đã enable:
- ✅ Email/Password authentication
- ✅ Google Sign-In (nếu dùng)

#### C. Firebase Storage (nếu dùng)
- Cấu hình Storage Rules nếu cần

### 4. Build & Test Local

```bash
# Test build locally
cd client
npm run build

# Preview production build
npm run preview
```

Kiểm tra:
- ✅ Build thành công không có lỗi
- ✅ Preview hoạt động bình thường
- ✅ Tất cả assets load đúng

---

## 🌐 Deploy Options

### Option 1: Deploy lên Vercel (Recommended cho Frontend)

#### A. Deploy Frontend (Client)

1. **Cài Vercel CLI** (nếu chưa có):
```bash
npm install -g vercel
```

2. **Login Vercel**:
```bash
vercel login
```

3. **Deploy từ thư mục client**:
```bash
cd client
vercel
```

4. **Cấu hình Environment Variables trên Vercel**:
   - Vào Vercel Dashboard → Project Settings → Environment Variables
   - Thêm tất cả biến từ `client/.env`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_DATABASE_URL`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

5. **Deploy Production**:
```bash
vercel --prod
```

#### B. Deploy Backend (Server cho OTP)

**Option 1: Vercel Serverless Functions**

Tạo file `api/send-otp.js`:
```javascript
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send email logic...
  
  res.json({ success: true, otp });
};
```

**Option 2: Deploy Backend riêng lên Railway/Render**

Xem phần Railway bên dưới.

---

### Option 2: Deploy lên Netlify

1. **Cài Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Deploy**:
```bash
cd client
netlify deploy --prod
```

4. **Cấu hình**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Thêm Environment Variables trong Netlify Dashboard

---

### Option 3: Deploy Backend lên Railway

1. **Tạo tài khoản Railway**: https://railway.app

2. **Tạo file `railway.json`** (trong root):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Deploy**:
   - Connect GitHub repo
   - Hoặc dùng Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

4. **Thêm Environment Variables** trong Railway Dashboard:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `PORT` (Railway tự động set)

5. **Lấy URL backend** và cập nhật trong frontend

---

### Option 4: Deploy lên Render

#### Frontend:
1. Tạo Static Site trên Render
2. Connect GitHub repo
3. Build command: `cd client && npm install && npm run build`
4. Publish directory: `client/dist`

#### Backend:
1. Tạo Web Service trên Render
2. Build command: `npm install`
3. Start command: `node server.js`
4. Thêm Environment Variables

---

## 🔧 Cấu Hình Sau Deploy

### 1. Cập Nhật Backend URL trong Frontend

Nếu backend deploy riêng, cập nhật URL trong code:

**File cần sửa**: `client/src/App.jsx` hoặc nơi gọi API OTP

```javascript
// Thay đổi từ:
const response = await fetch('http://localhost:3001/api/send-otp', {
  // ...
});

// Thành:
const response = await fetch('https://your-backend-url.railway.app/api/send-otp', {
  // ...
});
```

### 2. Cấu Hình CORS

Trong `server.js`, cập nhật CORS cho production:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### 3. Firebase Security

- ✅ Đảm bảo Firebase Rules đã được set đúng
- ✅ Giới hạn API key domain trong Firebase Console
- ✅ Enable App Check (recommended)

---

## 📝 Custom Domain (Optional)

### Vercel:
1. Vào Project Settings → Domains
2. Add domain
3. Cấu hình DNS records theo hướng dẫn

### Netlify:
1. Vào Site Settings → Domain Management
2. Add custom domain
3. Cấu hình DNS

---

## 🧪 Testing Production

Sau khi deploy, test các tính năng:

1. **Authentication**:
   - [ ] Đăng ký với email
   - [ ] Nhận OTP
   - [ ] Xác minh OTP
   - [ ] Đăng nhập
   - [ ] Google Sign-In

2. **Project Management**:
   - [ ] Tạo project
   - [ ] Join project
   - [ ] Invite members
   - [ ] Set permissions

3. **Code Editor**:
   - [ ] Tạo/xóa files
   - [ ] Tạo folders
   - [ ] Edit code
   - [ ] Sync code
   - [ ] File locking
   - [ ] Download files
   - [ ] Download ZIP

4. **Social Features**:
   - [ ] Add friends
   - [ ] Accept friend requests
   - [ ] Notifications
   - [ ] Chat

5. **Performance**:
   - [ ] Page load speed
   - [ ] Real-time sync speed
   - [ ] No console errors

---

## 🐛 Troubleshooting

### Lỗi: "Firebase not initialized"
- Kiểm tra environment variables đã set đúng
- Rebuild project sau khi thêm env vars

### Lỗi: "CORS error"
- Cập nhật CORS origin trong server.js
- Thêm frontend domain vào whitelist

### Lỗi: "OTP not sending"
- Kiểm tra Gmail App Password
- Kiểm tra backend URL
- Check server logs

### Lỗi: "Build failed"
- Xóa node_modules và reinstall
- Check package.json dependencies
- Check build logs

---

## 📊 Monitoring

### Vercel:
- Analytics tự động
- Error tracking
- Performance monitoring

### Railway/Render:
- Check logs: `railway logs` hoặc Render dashboard
- Monitor resource usage
- Set up alerts

---

## 🔄 CI/CD (Optional)

### GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd client
          npm install
      
      - name: Build
        run: |
          cd client
          npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          # ... other env vars
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client
```

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## ✅ Final Checklist

Trước khi announce production:

- [ ] Tất cả features đã test
- [ ] Environment variables đã set
- [ ] Firebase rules đã publish
- [ ] Backend đã deploy và hoạt động
- [ ] Frontend đã deploy và hoạt động
- [ ] Custom domain đã setup (nếu có)
- [ ] SSL certificate active
- [ ] Performance acceptable
- [ ] No critical errors
- [ ] Backup data (nếu cần)
- [ ] Documentation updated

---

## 🎉 Sau Khi Deploy

1. **Announce**: Thông báo cho team/users
2. **Monitor**: Theo dõi logs và errors
3. **Backup**: Backup Firebase data định kỳ
4. **Update**: Keep dependencies updated
5. **Scale**: Monitor usage và scale khi cần

---

**Chúc mừng! Dự án của bạn đã sẵn sàng production! 🚀**
