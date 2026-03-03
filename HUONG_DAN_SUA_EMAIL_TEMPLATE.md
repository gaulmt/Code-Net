# 📧 Hướng Dẫn Sửa Đổi Form Email OTP

## 📍 VỊ TRÍ FILE

File cần sửa: `server.js` (dòng 40-120)

## 🎨 CÁC PHẦN CÓ THỂ SỬA

### 1. TIÊU ĐỀ EMAIL (Header)
```javascript
// Dòng 52-55 trong server.js
<div class="header">
  <h1>🔐 Code Net</h1>
  <p>Xác Minh Tài Khoản</p>
</div>
```

**Có thể sửa:**
- Icon: `🔐` → `✉️`, `🎯`, `🚀`, v.v.
- Tên app: `Code Net` → Tên khác
- Tiêu đề phụ: `Xác Minh Tài Khoản` → Text khác

### 2. LỜI CHÀO (Greeting)
```javascript
// Dòng 58
<h2>Xin chào ${name || 'bạn'}!</h2>
<p>Cảm ơn bạn đã đăng ký Code Net...</p>
```

**Có thể sửa:**
- Lời chào: `Xin chào` → `Hi`, `Hello`, `Chào mừng`
- Nội dung: Thay đổi text giới thiệu

### 3. KHUNG MÃ OTP (OTP Box)
```javascript
// Dòng 60-61
<div class="otp-box">${otp}</div>
```

**Có thể sửa CSS (dòng 35-45):**
```css
.otp-box {
  background: #f8f9fa;           /* Màu nền */
  border: 2px dashed #667eea;    /* Viền */
  border-radius: 8px;            /* Bo góc */
  padding: 20px;                 /* Khoảng cách trong */
  margin: 30px 0;                /* Khoảng cách ngoài */
  font-size: 36px;               /* Cỡ chữ */
  font-weight: bold;             /* Độ đậm */
  color: #667eea;                /* Màu chữ */
  letter-spacing: 8px;           /* Khoảng cách giữa các số */
}
```

### 4. THÔNG TIN BỔ SUNG (Info)
```javascript
// Dòng 62-66
<p class="info">
  ⏰ Mã OTP có hiệu lực trong <strong>5 phút</strong><br>
  🔒 Không chia sẻ mã này với bất kỳ ai<br>
  ❓ Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email
</p>
```

**Có thể sửa:**
- Icon: Thay đổi emoji
- Thời gian: `5 phút` → Thời gian khác
- Nội dung: Thêm/bớt dòng thông tin

### 5. FOOTER
```javascript
// Dòng 70-72
<div class="footer">
  <p>© 2026 Code Net - Nền tảng code cộng tác real-time</p>
  <p>Email này được gửi tự động, vui lòng không reply</p>
</div>
```

**Có thể sửa:**
- Copyright: Năm, tên công ty
- Mô tả: Thay đổi slogan
- Lưu ý: Thêm thông tin liên hệ

### 6. MÀU SẮC (Colors)
```css
/* Header gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Màu chữ OTP */
color: #667eea;

/* Màu viền OTP */
border: 2px dashed #667eea;
```

**Gợi ý màu:**
- Xanh dương: `#667eea`, `#4ECDC4`
- Tím: `#764ba2`, `#9b59b6`
- Xanh lá: `#2ecc71`, `#27ae60`
- Cam: `#e67e22`, `#f39c12`
- Đỏ: `#e74c3c`, `#c0392b`

## 📝 VÍ DỤ SỬA ĐỔI

### Ví dụ 1: Đổi màu sang xanh lá
```javascript
// Trong server.js, tìm và thay:
.header {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  /* Thay vì: #667eea và #764ba2 */
}

.otp-box {
  border: 2px dashed #2ecc71;
  color: #2ecc71;
  /* Thay vì: #667eea */
}
```

### Ví dụ 2: Thêm logo
```javascript
<div class="header">
  <img src="https://your-domain.com/logo.png" alt="Logo" style="width: 80px; margin-bottom: 10px;">
  <h1>🔐 Code Net</h1>
  <p>Xác Minh Tài Khoản</p>
</div>
```

### Ví dụ 3: Đổi font chữ
```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* Thay vì: Arial, sans-serif */
}
```

### Ví dụ 4: Thêm nút CTA
```javascript
<p class="info">
  ⏰ Mã OTP có hiệu lực trong <strong>5 phút</strong><br>
  🔒 Không chia sẻ mã này với bất kỳ ai<br>
  ❓ Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email
</p>

<!-- THÊM NÚT -->
<a href="https://your-website.com" style="
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
">
  Truy cập Website
</a>
```

## 🔧 CÁCH SỬA

### Bước 1: Mở file server.js
```bash
# Trong VS Code hoặc editor
code server.js
```

### Bước 2: Tìm phần HTML template
- Tìm dòng: `const htmlContent = \``
- Phần HTML nằm từ dòng ~40 đến ~120

### Bước 3: Sửa đổi
- Sửa text, màu sắc, CSS theo ý muốn
- Lưu file (Ctrl + S)

### Bước 4: Restart server
```bash
# Dừng server (Ctrl + C)
# Chạy lại
npm run server
```

### Bước 5: Test
- Đăng ký tài khoản mới
- Kiểm tra email nhận được
- Xem email có đúng như mong muốn không

## 🎨 TEMPLATE MẪU

### Template 1: Minimalist (Tối giản)
```javascript
const htmlContent = `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial; background: #f5f5f5; padding: 40px;">
    <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px;">
      <h1 style="color: #333; text-align: center;">Mã OTP của bạn</h1>
      <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 10px; margin: 30px 0;">
        ${otp}
      </div>
      <p style="color: #666; text-align: center;">Mã có hiệu lực trong 5 phút</p>
    </div>
  </body>
  </html>
`;
```

### Template 2: Modern (Hiện đại)
```javascript
const htmlContent = `
  <!DOCTYPE html>
  <html>
  <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div style="background: white; padding: 50px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px;">
      <h1 style="color: #667eea; text-align: center; margin-bottom: 10px;">🔐 Xác Minh OTP</h1>
      <p style="color: #999; text-align: center; margin-bottom: 30px;">Xin chào ${name || 'bạn'}!</p>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; font-size: 40px; font-weight: bold; letter-spacing: 12px; border-radius: 10px; margin: 30px 0;">
        ${otp}
      </div>
      <p style="color: #666; text-align: center; font-size: 14px;">⏰ Có hiệu lực trong 5 phút</p>
    </div>
  </body>
  </html>
`;
```

### Template 3: Professional (Chuyên nghiệp)
```javascript
const htmlContent = `
  <!DOCTYPE html>
  <html>
  <body style="font-family: 'Segoe UI', sans-serif; background: #f8f9fa; margin: 0; padding: 40px;">
    <table style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="background: #2c3e50; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Code Net</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Xác Minh Tài Khoản</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px;">
          <p style="color: #333; font-size: 16px;">Xin chào <strong>${name || 'bạn'}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Cảm ơn bạn đã đăng ký. Đây là mã OTP để xác minh tài khoản:</p>
          <div style="background: #ecf0f1; border-left: 4px solid #3498db; padding: 20px; margin: 30px 0; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #2c3e50; letter-spacing: 8px;">${otp}</div>
          </div>
          <p style="color: #666; font-size: 14px;">
            ⏰ Mã có hiệu lực trong <strong>5 phút</strong><br>
            🔒 Không chia sẻ mã này với bất kỳ ai
          </p>
        </td>
      </tr>
      <tr>
        <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p style="margin: 0;">© 2026 Code Net. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;
```

## 🚀 TIPS

1. **Test trên nhiều email client:**
   - Gmail
   - Outlook
   - Yahoo Mail
   - Mobile apps

2. **Sử dụng inline CSS:**
   - Một số email client không hỗ trợ `<style>` tag
   - Dùng `style="..."` trực tiếp trên element

3. **Tránh JavaScript:**
   - Email không chạy JavaScript
   - Chỉ dùng HTML + CSS

4. **Responsive:**
   - Dùng `max-width` thay vì `width` cố định
   - Test trên mobile

5. **Màu sắc:**
   - Dùng hex code (#667eea) thay vì tên màu
   - Đảm bảo contrast tốt cho dễ đọc

## 📞 HỖ TRỢ

Nếu cần thêm tính năng:
- Thêm logo/hình ảnh
- Thêm social media links
- Thêm nút CTA
- Đổi layout hoàn toàn

→ Hỏi tôi cụ thể bạn muốn sửa gì!

---

**File cần sửa:** `server.js`  
**Dòng:** 40-120  
**Restart server sau khi sửa:** `npm run server`
