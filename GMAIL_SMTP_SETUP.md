# Gmail SMTP Setup Guide - Gửi OTP qua Email

## Bước 1: Bật 2-Step Verification

1. Vào https://myaccount.google.com/security
2. Tìm "2-Step Verification" (Xác minh 2 bước)
3. Click "Get Started" và làm theo hướng dẫn
4. Xác minh bằng số điện thoại

## Bước 2: Tạo App Password

1. Sau khi bật 2-Step Verification, vào https://myaccount.google.com/apppasswords
2. Hoặc: Google Account → Security → 2-Step Verification → App passwords
3. Chọn:
   - **Select app**: Mail
   - **Select device**: Other (Custom name)
   - Nhập tên: "Code Net OTP"
4. Click "Generate"
5. Copy mã 16 ký tự (dạng: `xxxx xxxx xxxx xxxx`)

## Bước 3: Cấu Hình .env

1. Mở file `.env` trong thư mục root
2. Thay thế:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Ví dụ:
```env
GMAIL_USER=myemail@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

## Bước 4: Test Server

```bash
# Chạy server
npm run server

# Hoặc chạy cả frontend + backend
npm run dev
```

Server sẽ chạy tại: http://localhost:3001

## Bước 5: Test Gửi Email

### Dùng Postman hoặc curl:
```bash
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","name":"Test User"}'
```

### Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

## Troubleshooting

### Lỗi: "Invalid login"
- Kiểm tra GMAIL_USER đúng email chưa
- Kiểm tra GMAIL_APP_PASSWORD đúng chưa (16 ký tự)
- Đảm bảo đã bật 2-Step Verification

### Lỗi: "Less secure app access"
- Không cần bật "Less secure app access"
- Dùng App Password là đủ

### Email vào Spam
- Lần đầu gửi có thể vào Spam
- Mark as "Not Spam" để lần sau vào Inbox

### Rate Limit
- Gmail free: 500 emails/day
- Nếu gửi quá nhiều: Đợi 24h hoặc dùng email khác

## Email Template

Email sẽ có dạng:

```
Subject: 🔐 Mã OTP Xác Minh - Code Net

┌─────────────────────────────────┐
│      🔐 Code Net                │
│   Xác Minh Tài Khoản            │
├─────────────────────────────────┤
│ Xin chào [Tên]!                 │
│                                 │
│ Mã OTP của bạn là:              │
│                                 │
│    ┌─────────────┐              │
│    │   123456    │              │
│    └─────────────┘              │
│                                 │
│ ⏰ Có hiệu lực trong 5 phút     │
│ 🔒 Không chia sẻ với ai         │
└─────────────────────────────────┘
```

## Security Notes

⚠️ **QUAN TRỌNG:**
- Không commit file `.env` lên Git
- Không share App Password với ai
- Revoke App Password nếu bị lộ
- Dùng biến môi trường khi deploy

## Production Deployment

Khi deploy lên server:

### Vercel/Netlify (Serverless):
```bash
# Set environment variables trong dashboard
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### VPS/Heroku:
```bash
# Set environment variables
export GMAIL_USER=your-email@gmail.com
export GMAIL_APP_PASSWORD=your-app-password
```

## Alternative: SendGrid/Mailgun

Nếu không muốn dùng Gmail, có thể dùng:
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5000 emails/month free
- **AWS SES**: $0.10 per 1000 emails

## Status

✅ Server setup hoàn tất
✅ Gmail SMTP configured
✅ Email template đẹp
✅ Ready to integrate với frontend
