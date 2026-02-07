import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// @route   POST /api/support/send
// @desc    Send support email
// @access  Public
router.post('/send', async (req, res) => {
  try {
    const { name, mobile, email, description } = req.body;

    // Validation
    if (!name || !mobile || !email || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email to support team
    const mailOptions = {
      from: `"Calculator Hub Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Support Request from ${name}`,
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
            .field {
              margin-bottom: 20px;
            }
            .label {
              font-weight: 600;
              color: #667eea;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .description-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              min-height: 100px;
              white-space: pre-wrap;
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
              <h1>🎧 New Support Request</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">Mobile:</div>
                <div class="value">${mobile}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              
              <div class="field">
                <div class="label">Description:</div>
                <div class="description-box">${description}</div>
              </div>
              
              <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
                📅 Received on: ${new Date().toLocaleString()}
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message from Calculator Hub Support System.</p>
              <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Calculator Hub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: "Support request sent successfully! We will contact you soon." 
    });

  } catch (err) {
    console.error('Support email error:', err);
    res.status(500).json({ message: "Failed to send support request" });
  }
});

export default router;
