import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import passport from 'passport';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendPasswordResetOTP } from '../utils/emailService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    
    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        msg: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Create token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        notepad: savedUser.notepad
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        notepad: user.notepad
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset token
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    // Generate reset token (6-digit code)
    const resetToken = crypto.randomInt(100000, 999999).toString();

    // Hash the token before saving
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token and expiry (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP via email
    try {
      await sendPasswordResetOTP(email, resetToken);
      
      res.json({ 
        message: "Password reset OTP has been sent to your email. Please check your inbox."
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // If email fails, still provide the token in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 Password Reset Token for ${email}: ${resetToken}\n`);
        res.json({ 
          message: "Email service unavailable. For development, check console for OTP.",
          devToken: resetToken
        });
      } else {
        // In production, if email fails, return error
        res.status(500).json({ 
          message: "Failed to send reset email. Please try again later." 
        });
      }
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        message: "Password must contain uppercase, lowercase, number, and special character" 
      });
    }

    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (username and picture)
// @access  Private
router.put('/profile', auth, upload.single('picture'), async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update fields if provided
    if (username !== undefined) {
      user.username = username.trim();
    }
    if (req.file) {
      user.picture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        picture: user.picture,
        notepad: user.notepad
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

// @route   DELETE /api/auth/profile/picture
// @desc    Remove user profile picture
// @access  Private
router.delete('/profile/picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Remove picture
    user.picture = null;
    await user.save();

    res.json({
      msg: 'Profile picture removed successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        picture: user.picture,
        notepad: user.notepad
      }
    });
  } catch (err) {
    console.error('Remove picture error:', err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      // Create JWT token for the user
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}&email=${encodeURIComponent(req.user.email)}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=authentication_failed`);
    }
  }
);

export default router;
