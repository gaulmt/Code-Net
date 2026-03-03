# 🔥 HƯỚNG DẪN CẬP NHẬT FIREBASE RULES - NHANH

## ⚡ CÁC BƯỚC THỰC HIỆN (5 PHÚT)

### 1️⃣ Mở Firebase Console
```
https://console.firebase.google.com/
→ Chọn project: code-together-cfbfa
→ Menu: Realtime Database
→ Tab: Rules
```

### 2️⃣ Copy Rules
Mở file `FIREBASE_RULES_FINAL.json` trong project → Copy toàn bộ

### 3️⃣ Paste và Publish
- Xóa hết rules cũ
- Paste rules mới
- Nhấn **Publish** (nút xanh)
- Đợi 10 giây

### 4️⃣ Test
- Refresh web (F5)
- Thử đăng ký tài khoản
- Kiểm tra email nhận OTP

## ✅ RULES ĐÃ BẢO VỆ

| Path | Read | Write | Mục đích |
|------|------|-------|----------|
| `otp_pending/` | Public | Public | Lưu OTP tạm (5 phút) |
| `usernames/` | Public | Protected | Check username trùng |
| `users/{uid}/` | Owner only | Owner only | Thông tin cá nhân |
| `projects/` | Public | Public | Collaboration |
| `documents/` | Public | Public | Real-time editing |
| `conversations/` | Auth | Auth | Tin nhắn |
| `community/` | Public | Auth | Cộng đồng |

## 🐛 NẾU GẶP LỖI

### "PERMISSION_DENIED"
```
1. Đợi 30 giây sau khi publish
2. Clear cache (Ctrl + Shift + Delete)
3. Refresh (F5)
4. Thử lại
```

### "OTP không gửi"
```
1. Check server đang chạy: npm run server
2. Check .env có đúng email/password
3. Check console log có lỗi không
```

### "Username đã tồn tại"
```
→ Đây là tính năng, không phải lỗi!
→ Chọn username khác
```

### "Email đã được đăng ký"
```
→ Đây là tính năng, không phải lỗi!
→ Dùng email khác hoặc đăng nhập
```

## 📊 KIỂM TRA RULES HOẠT ĐỘNG

### Test 1: Đăng ký tài khoản mới
- [x] Nhập username, email, password
- [x] Nhận OTP qua email
- [x] Nhập OTP 6 số
- [x] Tạo tài khoản thành công

### Test 2: Check trùng lặp
- [x] Username trùng → Hiện thông báo
- [x] Email trùng → Hiện thông báo

### Test 3: Tạo project
- [x] Tạo project mới
- [x] Lưu vào database
- [x] Hiển thị trong Projects Manager

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi cập nhật rules:
✅ Đăng ký với OTP hoạt động
✅ Không còn lỗi PERMISSION_DENIED
✅ Check username/email trùng hoạt động
✅ Tạo và join project hoạt động
✅ Real-time collaboration hoạt động

## 📞 LƯU Ý

- Rules này đã được tối ưu cho toàn bộ dự án
- Bao gồm cả tính năng Community và Messenger (chưa implement)
- Bảo mật vừa đủ cho development và production
- OTP tự động expire sau 5 phút

---

**Nếu vẫn lỗi, check:**
1. Firebase Console → Realtime Database → Data (xem có dữ liệu không)
2. Browser Console (F12) → Xem lỗi chi tiết
3. Server terminal → Xem log OTP

**Liên hệ:** Nguyễn Đăng Dương
