# Cài đặt JSZip để tải về ZIP

## Bước 1: Cài đặt thư viện

Chạy lệnh sau trong thư mục `client`:

```bash
cd client
npm install jszip file-saver
```

## Bước 2: Sau khi cài xong

Reload lại trang web và tính năng download ZIP sẽ hoạt động.

## Thư viện sử dụng:
- `jszip`: Tạo file ZIP
- `file-saver`: Lưu file xuống máy

## Lưu ý:
- Phải chạy lệnh trong thư mục `client`, không phải root
- Sau khi cài xong, restart dev server nếu cần
