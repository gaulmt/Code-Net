const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .otp-box {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 4px;
          }
          .info {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Code Net</h1>
            <p>Xác Minh Tài Khoản</p>
          </div>
          <div class="content">
            <h2>Xin chào ${name || 'bạn'}!</h2>
            <p>Cảm ơn bạn đã đăng ký Code Net. Đây là mã OTP để xác minh tài khoản của bạn:</p>
            <div class="otp-box">${otp}</div>
            <p class="info">
              ⏰ Mã OTP có hiệu lực trong <strong>5 phút</strong><br>
              🔒 Không chia sẻ mã này với bất kỳ ai<br>
              ❓ Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Code Net - Nền tảng code cộng tác real-time</p>
            <p>Email này được gửi tự động, vui lòng không reply</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"Code Net" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🔐 Mã OTP Xác Minh - Code Net',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ OTP sent to:', email, '| OTP:', otp);

    // Return OTP (in production, save to database instead)
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp // For development only - remove in production
    });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OTP Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 OTP Server running on http://localhost:${PORT}`);
  console.log(`📧 Gmail SMTP configured: ${process.env.GMAIL_USER || 'NOT SET'}`);
});
