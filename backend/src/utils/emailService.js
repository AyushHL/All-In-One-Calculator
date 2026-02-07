import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email for password reset
export const sendPasswordResetOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Calculator Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - Calculator Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .otp-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              border-radius: 12px;
              margin: 30px 0;
              font-family: 'Courier New', monospace;
            }
            .info {
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6c757d;
              font-size: 14px;
              background: #f8f9fa;
            }
            p {
              line-height: 1.6;
              color: #333;
            }
            .warning {
              color: #dc3545;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You recently requested to reset your password for your Calculator Hub account. Use the OTP code below to complete the process:</p>
              
              <div class="otp-box">
                ${otp}
              </div>
              
              <div class="info">
                <p style="margin: 0;"><strong>⏰ Valid for 15 minutes</strong></p>
                <p style="margin: 5px 0 0 0;">This code will expire after 15 minutes for security reasons.</p>
              </div>
              
              <p>Enter this code on the password reset page to create a new password.</p>
              
              <p class="warning">⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>For security reasons:</p>
              <ul>
                <li>Never share this code with anyone</li>
                <li>Calculator Hub will never ask for your password via email</li>
                <li>This code is only valid for a single use</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message from Calculator Hub.<br>
              Please do not reply to this email.</p>
              <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Calculator Hub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email (optional)
export const sendWelcomeEmail = async (email) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Calculator Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Calculator Hub! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .feature {
              display: flex;
              align-items: center;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6c757d;
              font-size: 14px;
              background: #f8f9fa;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Calculator Hub!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for joining Calculator Hub! We're excited to have you on board.</p>
              
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>📊 Use 8+ different calculator types</li>
                <li>📝 Save notes and calculations</li>
                <li>📜 Track your calculation history</li>
                <li>✍️ Use auto-saving notepad</li>
                <li>👤 Customize your profile</li>
              </ul>
              
              <p>Get started now and explore all the features!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Calculator Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
};

export default { sendPasswordResetOTP, sendWelcomeEmail };
