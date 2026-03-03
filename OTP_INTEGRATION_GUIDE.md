# OTP Integration Guide - Tích Hợp Vào Frontend

## Overview

Sau khi setup Gmail SMTP server, chúng ta sẽ tích hợp OTP verification vào flow đăng ký:

```
Signup Form → Send OTP API → Email → User nhập OTP → Verify → Create Account
```

## Step 1: Update firebase.js

Thêm functions gọi API và verify OTP:

```javascript
// Send OTP via email
export const sendOTPEmail = async (email, name) => {
  try {
    const response = await fetch('http://localhost:3001/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send OTP');
    }
    
    // Save OTP to Firebase for verification
    const otpRef = ref(database, `otp_pending/${email.replace(/[.@]/g, '_')}`);
    await set(otpRef, {
      otp: data.otp, // In production, don't return OTP from API
      email: email,
      expiryTime: Date.now() + (5 * 60 * 1000),
      createdAt: Date.now()
    });
    
    return data.otp; // For development
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otpCode) => {
  const otpRef = ref(database, `otp_pending/${email.replace(/[.@]/g, '_')}`);
  const snapshot = await get(otpRef);
  
  if (!snapshot.exists()) {
    throw new Error('Mã OTP không tồn tại');
  }
  
  const otpData = snapshot.val();
  
  // Check expiry
  if (Date.now() > otpData.expiryTime) {
    await remove(otpRef);
    throw new Error('Mã OTP đã hết hạn');
  }
  
  // Check match
  if (otpData.otp !== otpCode.trim()) {
    throw new Error('Mã OTP không đúng');
  }
  
  // Clean up
  await remove(otpRef);
  return true;
};
```

## Step 2: Update Signup Flow

### App.jsx - handleSignup:

```javascript
const handleSignup = async (username, email, password) => {
  try {
    // Step 1: Send OTP
    await sendOTPEmail(email, username);
    showToast('Mã OTP đã được gửi đến email!', 'success');
    
    // Step 2: Show OTP input screen
    setShowOTPVerification(true);
    setPendingSignup({ username, email, password });
    
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
};

const handleVerifyOTP = async (otpCode) => {
  try {
    // Verify OTP
    await verifyOTP(pendingSignup.email, otpCode);
    
    // Create Firebase account
    await signUpUser(
      pendingSignup.email, 
      pendingSignup.password, 
      pendingSignup.username
    );
    
    showToast('Đăng ký thành công!', 'success');
    setShowOTPVerification(false);
    
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error');
  }
};
```

## Step 3: OTP Input UI

### Landing.jsx - OTP Screen:

```jsx
{showOTPVerification && (
  <div className="modal-container">
    <div className="modal-box">
      <h2>Xác Minh OTP</h2>
      <p>Mã OTP đã được gửi đến: {pendingSignup.email}</p>
      
      {/* 6 OTP input boxes */}
      <div className="otp-inputs">
        {[0,1,2,3,4,5].map(i => (
          <input
            key={i}
            type="text"
            maxLength="1"
            value={otp[i]}
            onChange={(e) => handleOTPChange(i, e.target.value)}
            onKeyDown={(e) => handleOTPKeyDown(i, e)}
          />
        ))}
      </div>
      
      <button onClick={() => handleVerifyOTP(otp.join(''))}>
        Xác Minh
      </button>
      
      <button onClick={handleResendOTP}>
        Gửi lại OTP
      </button>
    </div>
  </div>
)}
```

## Step 4: Test Flow

1. **Start servers:**
```bash
npm run dev
```

2. **Signup:**
   - Nhập username, email, password
   - Click "Đăng ký"

3. **Check email:**
   - Mở Gmail
   - Tìm email từ Code Net
   - Copy mã OTP 6 số

4. **Verify:**
   - Nhập OTP vào 6 boxes
   - Click "Xác Minh"
   - Account được tạo!

## Security Best Practices

### ✅ DO:
- Hash OTP trước khi lưu vào database
- Set expiry time (5 phút)
- Rate limit: Max 3 OTP/email/hour
- Clean up expired OTP
- Log failed attempts

### ❌ DON'T:
- Không return OTP từ API (production)
- Không lưu OTP plain text
- Không cho phép unlimited resend
- Không skip verification

## Production Checklist

- [ ] Remove `otp` from API response
- [ ] Add rate limiting (express-rate-limit)
- [ ] Hash OTP before saving
- [ ] Add CAPTCHA for signup
- [ ] Monitor failed attempts
- [ ] Set up email templates
- [ ] Test with multiple email providers
- [ ] Add logging and monitoring

## Next Steps

1. ✅ Setup Gmail SMTP (xem GMAIL_SMTP_SETUP.md)
2. ⏳ Test gửi email
3. ⏳ Integrate vào frontend
4. ⏳ Test full flow
5. ⏳ Deploy to production

## Status

✅ Backend server ready
✅ Email template designed
⏳ Waiting for Gmail SMTP setup
⏳ Frontend integration pending
