# 🔥 Hướng Dẫn Cập Nhật Firebase Rules

## ⚠️ VẤN ĐỀ HIỆN TẠI
Bạn đã xóa Firebase Rules, dẫn đến lỗi `PERMISSION_DENIED` khi:
- Kiểm tra username đã tồn tại
- Lưu OTP vào database
- Tạo tài khoản người dùng
- Truy cập dữ liệu projects

## ✅ GIẢI PHÁP

### Bước 1: Mở Firebase Console
1. Truy cập: https://console.firebase.google.com/
2. Chọn project: **code-together-cfbfa**
3. Vào menu bên trái: **Realtime Database**
4. Chọn tab: **Rules**

### Bước 2: Copy Rules Mới
Mở file `FIREBASE_RULES_COMPLETE.json` trong project này và copy toàn bộ nội dung.

### Bước 3: Paste và Publish
1. Xóa toàn bộ rules cũ trong Firebase Console
2. Paste rules mới vào
3. Nhấn nút **Publish** (màu xanh)
4. Chờ vài giây để rules được áp dụng

### Bước 4: Test Lại
1. Refresh trang web của bạn (F5)
2. Thử đăng ký tài khoản mới
3. Kiểm tra xem có nhận được OTP qua email không
4. Nhập OTP và hoàn tất đăng ký

## 📋 CẤU TRÚC DATABASE ĐƯỢC BẢO VỆ

### 1. **otp_pending/** - Lưu OTP tạm thời
- Read: Public (để verify OTP)
- Write: Public (để lưu OTP mới)
- Tự động xóa sau 5 phút

### 2. **usernames/** - Mapping userId → username
- Read: Public (để check username trùng)
- Write: Chỉ user đó hoặc username chưa tồn tại

### 3. **users/{userId}/** - Thông tin người dùng
- Read: Chỉ user đó
- Write: Chỉ user đó
- Bao gồm: profile, projects, friends, status

### 4. **projects/{projectId}/** - Dữ liệu projects
- Read: Public (để join project)
- Write: Public (để collaborate)
- Bao gồm: metadata, members, collaborators

### 5. **documents/{documentId}/** - Code editor data
- Read: Public
- Write: Public
- Bao gồm: users, content, chat, cursors, files

### 6. **conversations/** - Tin nhắn
- Read: Chỉ người đã đăng nhập
- Write: Chỉ người đã đăng nhập

### 7. **community/** - Cộng đồng
- Read: Public (posts), Auth required (following/followers)
- Write: Chỉ người đã đăng nhập

## 🔒 BẢO MẬT

### Rules Hiện Tại:
- ✅ OTP: Public read/write (cần thiết cho xác thực)
- ✅ Usernames: Public read, protected write
- ✅ User data: Chỉ chủ sở hữu
- ✅ Projects: Public (cho collaboration)
- ✅ Documents: Public (cho real-time editing)
- ✅ Conversations: Chỉ người đã đăng nhập
- ✅ Community: Public read, auth write

### Lưu Ý Bảo Mật:
1. **OTP**: Tự động expire sau 5 phút
2. **User Profile**: Chỉ chủ sở hữu có thể sửa
3. **Projects**: Public để hỗ trợ collaboration
4. **Conversations**: Cần đăng nhập để xem/gửi

## 🚀 SAU KHI CẬP NHẬT

### Tính Năng Hoạt Động:
✅ Đăng ký với OTP qua email
✅ Kiểm tra username/email trùng
✅ Tạo và quản lý projects
✅ Real-time collaboration
✅ Chat và messaging
✅ Community posts

### Test Checklist:
- [ ] Đăng ký tài khoản mới
- [ ] Nhận OTP qua email
- [ ] Xác minh OTP thành công
- [ ] Tạo project mới
- [ ] Join project bằng code
- [ ] Lưu và load projects

## ❓ NẾU VẪN LỖI

### Lỗi: "PERMISSION_DENIED"
1. Kiểm tra rules đã publish chưa
2. Đợi 10-30 giây để rules áp dụng
3. Clear cache browser (Ctrl + Shift + Delete)
4. Refresh trang (F5)

### Lỗi: "Network Error"
1. Kiểm tra internet
2. Kiểm tra Firebase project còn hoạt động
3. Kiểm tra quota Firebase (free plan có giới hạn)

### Lỗi: "Invalid Email"
1. Kiểm tra email format đúng
2. Kiểm tra Firebase Authentication đã enable Email/Password

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề:
1. Check Firebase Console → Realtime Database → Data
2. Xem có dữ liệu được tạo không
3. Check Firebase Console → Authentication → Users
4. Xem có user được tạo không

---

**Tác giả:** Nguyễn Đăng Dương  
**Project:** Code Net - Real-time Collaboration Platform  
**Date:** 2026
