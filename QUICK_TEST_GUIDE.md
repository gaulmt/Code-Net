# 🧪 Hướng Dẫn Test Nhanh - Hệ Thống Thông Báo

## ⚡ CHUẨN BỊ

1. **Thêm file âm thanh** (tùy chọn):
   - Tải file `notification.mp3` 
   - Copy vào `client/public/`
   - Nếu không có, hệ thống vẫn hoạt động (không có âm thanh)

2. **Refresh browser:**
   ```
   Ctrl + Shift + R
   ```

## 🧪 TEST LUỒNG KẾT BẠN

### Bước 1: Chuẩn bị 2 tài khoản
- Mở 2 browser/tab khác nhau
- Đăng nhập 2 tài khoản: User A và User B

### Bước 2: User A gửi lời mời
1. User A vào project bất kỳ
2. Click nút **👥** (Friends) ở header
3. Tab "Thêm bạn"
4. Nhập username của User B
5. Click "Tìm"
6. Click "Kết bạn"

### Bước 3: User B nhận thông báo
1. User B sẽ thấy:
   - 🔔 Badge số (1) xuất hiện
   - Âm thanh phát (nếu có file)
2. Click vào 🔔
3. Thấy thông báo: "User A đã gửi lời mời kết bạn"
4. Click **"Chấp nhận"**

### Bước 4: User A nhận xác nhận
1. User A sẽ thấy badge (1)
2. Click 🔔
3. Thấy: "User B đã chấp nhận lời mời kết bạn"

### ✅ Kết quả mong đợi:
- Cả 2 đã là bạn bè
- Có thể thấy nhau trong danh sách bạn bè

## 🎯 KIỂM TRA

### Notification Bell:
- [ ] Badge hiển thị số thông báo
- [ ] Click bell → Dropdown mở
- [ ] Thông báo hiển thị đúng
- [ ] Avatar hiển thị
- [ ] Thời gian hiển thị (vừa xong, 2 phút...)
- [ ] Nút "Chấp nhận/Từ chối" hoạt động
- [ ] Âm thanh phát (nếu có file)

### Friends List:
- [ ] Click 👥 → Modal mở
- [ ] Tab "Danh sách" hiển thị bạn bè
- [ ] Tab "Thêm bạn" có search
- [ ] Tìm kiếm hoạt động
- [ ] Gửi lời mời thành công

## 🐛 NẾU CÓ LỖI

### Không thấy thông báo:
```bash
# Check console có lỗi không
F12 → Console tab
```

### Lỗi PERMISSION_DENIED:
1. Vào Firebase Console
2. Realtime Database → Rules
3. Copy nội dung từ `FIREBASE_RULES_PRODUCTION.json`
4. Paste và Publish
5. Đợi 10 giây
6. Refresh browser

### Không có âm thanh:
- Bình thường! Chỉ cần thêm file `notification.mp3` vào `client/public/`

## 📍 VỊ TRÍ COMPONENTS

### Trong Editor:
```
[Project / file.js]  [🔔(3)]  [👥]  [Download]  [Theme]  [Run]
                       ↑        ↑
                  Notification Friends
```

### Dropdown Notification:
```
Click 🔔 → Dropdown xuất hiện
- Hiển thị danh sách thông báo
- Actions: Chấp nhận/Từ chối/Xóa
- Đánh dấu đã đọc
```

### Friends Modal:
```
Click 👥 → Modal xuất hiện
- Tab 1: Danh sách bạn bè
- Tab 2: Thêm bạn (search)
```

---

**Bắt đầu test ngay!** 🚀
