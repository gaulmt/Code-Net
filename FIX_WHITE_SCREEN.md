# 🔧 Sửa Lỗi Web Trắng Tinh

## 🐛 NGUYÊN NHÂN CÓ THỂ

1. **Browser cache** - Code cũ còn trong cache
2. **Dev server chưa restart** - Vite chưa reload code mới
3. **Import error** - Thiếu import hoặc circular dependency
4. **Runtime error** - Lỗi khi chạy code

## ✅ GIẢI PHÁP

### Bước 1: Clear Browser Cache
```
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"
```

Hoặc:
```
Ctrl + Shift + Delete → Clear cache → Reload
```

### Bước 2: Restart Dev Server
```bash
# Dừng server (Ctrl + C trong terminal)
# Chạy lại
cd client
npm run dev
```

### Bước 3: Check Console Errors
```
1. Mở DevTools (F12)
2. Tab Console
3. Xem có lỗi màu đỏ không
4. Copy lỗi và gửi cho tôi
```

### Bước 4: Check Network Tab
```
1. DevTools → Network tab
2. Reload page
3. Xem file nào bị lỗi (màu đỏ)
4. Check status code
```

## 🔍 DEBUG STEPS

### Test 1: Check if React is loading
Mở Console và gõ:
```javascript
console.log('React version:', React.version);
```

### Test 2: Check if Firebase is loading
```javascript
console.log('Firebase:', firebase);
```

### Test 3: Check imports
Mở `client/src/main.jsx` và check:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 🚨 NẾU VẪN LỖI

### Option 1: Rollback Code
```bash
# Xem commit gần nhất hoạt động
git log --oneline

# Rollback về commit đó
git reset --hard <commit-hash>

# Hoặc stash changes
git stash
```

### Option 2: Reinstall Dependencies
```bash
cd client
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Option 3: Check Port Conflict
```bash
# Check port 5173 (Vite default)
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID> /F
```

## 📋 CHECKLIST

- [ ] Clear browser cache
- [ ] Restart dev server
- [ ] Check console errors
- [ ] Check network tab
- [ ] Test React loading
- [ ] Check main.jsx
- [ ] Reinstall dependencies (if needed)

## 💡 COMMON ERRORS

### Error: "Cannot find module"
→ Missing import or wrong path
→ Run `npm install`

### Error: "Unexpected token"
→ Syntax error in code
→ Check recent changes

### Error: "Firebase is not defined"
→ Import issue
→ Check firebase.js exports

### Blank white screen + no errors
→ Browser cache
→ Hard reload (Ctrl + Shift + R)

---

**Hãy làm theo thứ tự:**
1. Hard reload (Ctrl + Shift + R)
2. Check Console (F12)
3. Gửi screenshot lỗi cho tôi
