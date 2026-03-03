# 🔄 Hướng Dẫn Restart Server Sau Khi Sửa Email Template

## ⚠️ VẤN ĐỀ

Bạn đã sửa `server.js` nhưng email vẫn hiển thị font cũ vì:
- Server đang chạy với code cũ trong memory
- Cần restart để load code mới

## ✅ CÁCH RESTART SERVER

### Cách 1: Dừng và Chạy Lại (Khuyên dùng)

#### Bước 1: Dừng server
Trong terminal đang chạy server, nhấn:
```
Ctrl + C
```

#### Bước 2: Chạy lại
```bash
npm run server
```

Hoặc nếu chạy cả client + server:
```bash
npm run dev
```

### Cách 2: Dùng Nodemon (Tự động restart)

#### Cài đặt nodemon (chỉ làm 1 lần)
```bash
npm install -g nodemon
```

#### Chạy server với nodemon
```bash
nodemon server.js
```

Nodemon sẽ tự động restart khi bạn sửa file!

### Cách 3: Sửa package.json để dùng nodemon

Mở `package.json` và sửa:
```json
{
  "scripts": {
    "server": "nodemon server.js",
    "dev": "concurrently \"npm run server\" \"cd client && npm run dev\""
  }
}
```

Sau đó chạy:
```bash
npm run server
```

## 🧪 KIỂM TRA SERVER ĐÃ RESTART

Sau khi restart, bạn sẽ thấy:
```
🚀 OTP Server running on http://localhost:3002
📧 Gmail SMTP configured: lmtgau@gmail.com
```

## 📧 TEST EMAIL MỚI

### Bước 1: Đăng ký tài khoản mới
- Dùng email khác (hoặc xóa tài khoản cũ)
- Nhập thông tin và nhấn "Đăng ký"

### Bước 2: Kiểm tra email
- Mở email vừa nhận
- Kiểm tra font-size của mã OTP
- Nếu vẫn lớn → Server chưa restart đúng

### Bước 3: Nếu vẫn lỗi
1. Kiểm tra terminal có thông báo lỗi không
2. Kiểm tra file `server.js` đã lưu chưa (Ctrl + S)
3. Restart lại server
4. Clear cache email (refresh email)

## 🎯 THAY ĐỔI ĐÃ ÁP DỤNG

```css
.otp-box {
  font-size: 24px;        /* Giảm từ 36px → 24px */
  letter-spacing: 4px;    /* Giảm từ 8px → 4px */
}
```

**Kết quả:**
- Mã OTP nhỏ hơn
- Không bị xuống hàng
- Vẫn dễ đọc

## 💡 TIPS

### Nếu muốn nhỏ hơn nữa:
```css
.otp-box {
  font-size: 20px;
  letter-spacing: 2px;
}
```

### Nếu muốn vừa phải:
```css
.otp-box {
  font-size: 28px;
  letter-spacing: 5px;
}
```

### Nếu muốn lớn nhưng không xuống hàng:
```css
.otp-box {
  font-size: 32px;
  letter-spacing: 3px;
  word-spacing: 0;
}
```

## 🔍 DEBUG

### Kiểm tra server có đang chạy không:
```bash
# Windows
netstat -ano | findstr :3002

# Mac/Linux
lsof -i :3002
```

### Kiểm tra log server:
Xem terminal có log này không:
```
✅ OTP sent to: email@example.com | OTP: 123456
```

### Test API trực tiếp:
```bash
curl -X POST http://localhost:3002/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","name":"Test User"}'
```

## 📝 CHECKLIST

- [ ] Đã sửa file `server.js`
- [ ] Đã lưu file (Ctrl + S)
- [ ] Đã dừng server (Ctrl + C)
- [ ] Đã chạy lại server (`npm run server`)
- [ ] Thấy log "OTP Server running"
- [ ] Đăng ký tài khoản mới để test
- [ ] Kiểm tra email mới nhận
- [ ] Font-size đã đúng như mong muốn

## ⚡ QUICK FIX

Nếu vẫn không được, làm theo:

```bash
# 1. Dừng tất cả process Node.js
# Windows: Ctrl + C trong terminal
# Hoặc Task Manager → Tìm "node" → End Task

# 2. Xóa cache (optional)
npm cache clean --force

# 3. Chạy lại
npm run server

# 4. Test ngay
# Đăng ký tài khoản mới
```

---

**Lưu ý:** Mỗi lần sửa `server.js`, bạn PHẢI restart server!
