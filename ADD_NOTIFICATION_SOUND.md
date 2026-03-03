# 🔔 Thêm Âm Thanh Thông Báo

## 📁 FILE CẦN THÊM

Bạn cần thêm file âm thanh `notification.mp3` vào thư mục `client/public/`

## 📍 VỊ TRÍ

```
client/
└── public/
    ├── logo.jpg
    ├── admin.jpg
    └── notification.mp3  ← Thêm file này
```

## 🎵 CÁCH THÊM

### Option 1: Sử dụng file âm thanh có sẵn
1. Tìm file âm thanh notification.mp3 bạn đã chuẩn bị
2. Copy file vào thư mục `client/public/`
3. Đảm bảo tên file là `notification.mp3`

### Option 2: Tải âm thanh miễn phí
1. Truy cập: https://pixabay.com/sound-effects/search/notification/
2. Hoặc: https://freesound.org/search/?q=notification
3. Tải file âm thanh (định dạng .mp3)
4. Đổi tên thành `notification.mp3`
5. Copy vào `client/public/`

### Option 3: Tạo âm thanh đơn giản
Nếu không có file, bạn có thể tạm thời disable âm thanh bằng cách comment code trong `NotificationBell.jsx`:

```javascript
// Comment dòng này:
// audioRef.current?.play().catch(err => console.log('Audio play failed:', err));
```

## ✅ KIỂM TRA

Sau khi thêm file:
1. Refresh browser (Ctrl + Shift + R)
2. Gửi lời mời kết bạn
3. Kiểm tra âm thanh có phát không

## 🔊 YÊU CẦU FILE

- **Format:** MP3
- **Tên file:** `notification.mp3` (chính xác)
- **Kích thước:** < 100KB (khuyến nghị)
- **Độ dài:** 1-2 giây
- **Volume:** Vừa phải, không quá to

## 🎯 CODE SỬ DỤNG

File được sử dụng trong `NotificationBell.jsx`:

```javascript
useEffect(() => {
  audioRef.current = new Audio('/notification.mp3');
  audioRef.current.volume = 0.5;
}, []);
```

Đường dẫn `/notification.mp3` tương ứng với `client/public/notification.mp3`

---

**Lưu ý:** Nếu không có file âm thanh, component vẫn hoạt động bình thường, chỉ không có âm thanh thông báo.
