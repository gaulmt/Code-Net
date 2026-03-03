# ✅ Đã Sửa Lỗi Server Port Conflict

## ❌ VẤN ĐỀ

Server OTP (port 3002) bị conflict với Vite dev server, dẫn đến:
- API trả về HTML thay vì JSON
- Lỗi 404 khi gửi OTP
- Lỗi JSON parse

## 🔍 NGUYÊN NHÂN

Khi chạy `npm run dev` (cả client + server), có thể:
1. Cả 2 process cùng chiếm port 3002
2. Vite dev server chạy trước và chiếm port
3. Server OTP không start đúng

## ✅ GIẢI PHÁP

### Đã làm:
1. Dừng tất cả Node processes
2. Chạy riêng server OTP: `node server.js`
3. Chạy riêng client: `cd client && npm run dev`

### Ports hiện tại:
- **Server OTP:** `http://localhost:3002` ✅
- **Client Vite:** `http://localhost:3000` ✅

## 🚀 CÁCH CHẠY ĐÚNG

### Option 1: Chạy riêng (Khuyên dùng)

**Terminal 1 - Server OTP:**
```bash
node server.js
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### Option 2: Chạy cùng lúc
```bash
npm run dev
```

Nhưng đảm bảo `package.json` có:
```json
{
  "scripts": {
    "server": "node server.js",
    "client": "cd client && npm run dev",
    "dev": "concurrently \"npm run server\" \"npm run client\""
  }
}
```

## 🧪 TEST

### Test Server OTP:
```bash
curl http://localhost:3002/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","message":"OTP Server is running"}
```

### Test Client:
```
Mở browser: http://localhost:3000
```

## 🐛 NẾU VẪN LỖI

### Lỗi: Port already in use
```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Hoặc kill tất cả Node
Get-Process -Name node | Stop-Process -Force
```

### Lỗi: Cannot connect to server
1. Check server có chạy: `curl http://localhost:3002/api/health`
2. Check port đúng không: Server = 3002, Client = 3000
3. Check firewall

### Lỗi: CORS
Server đã có CORS enabled:
```javascript
app.use(cors());
```

## ✅ HIỆN TẠI

- ✅ Server OTP đang chạy port 3002
- ✅ Client đang chạy port 3000
- ✅ API test thành công
- ✅ CORS enabled

**Bây giờ refresh browser (Ctrl + Shift + R) và test đăng ký!**

---

**Status:** ✅ Fixed  
**Processes Running:**
- Process 7: Server OTP (port 3002)
- Process 8: Client Vite (port 3000)
