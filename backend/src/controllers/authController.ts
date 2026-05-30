import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendPasswordResetOTP } from '../utils/emailService.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Please Enter All Fields" });
    }

    // Password Validation
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 Characters" });
    }

    // Check Password Strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        msg: "Password must Contain at least One Uppercase Letter, One Lowercase Letter, One Number, and One Special Character"
      });
    }

    // Check if User Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User Already Exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Create Token
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
    console.error('Register Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Please Enter All Fields" });
    }

    // Check for User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User Does Not Exist" });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong Password" });
    }

    // Create Token
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
    console.error('Login Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is Required" });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No Account Found with this Email" });
    }

    // Generate Reset Token (6-Digit Code)
    const resetToken = crypto.randomInt(100000, 999999).toString();

    // Hash the Token before Saving
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save Token and Expiry (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send OTP via Email
    try {
      await sendPasswordResetOTP(email, resetToken);

      res.json({
        message: "Password Reset OTP has been sent to your Email. Please check your Inbox."
      });
    } catch (emailError) {
      console.error('Email Sending Error:', emailError);

      // If Email Fails, still provide the Token in Development Mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 Password Reset OTP for ${email}: ${resetToken}\n`);
        res.json({
          message: "Email Service Unavailable. For Development, check Console for OTP.",
          devToken: resetToken
        });
      } else {
        // In Production, if Email Fails, return Error
        res.status(500).json({
          message: "Failed to send Reset Email. Please try again later."
        });
      }
    }
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    // Password Validation
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 Characters" });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        message: "Password must contain Uppercase, Lowercase, Number, and Special Character"
      });
    }

    // Hash the Provided OTP
    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

    // Find User with Valid Token
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or Expired Reset OTP" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear Reset Token Fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password Reset Successful! You can now Log In." });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    // Update Fields If Provided
    if (username !== undefined) {
      user.username = username.trim();
    }
    if (req.file) {
      // Convert Buffer to Base64 Data URL and Store in DB
      const base64 = req.file.buffer.toString('base64');
      user.picture = `data:${req.file.mimetype};base64,${base64}`;
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
    console.error('Profile Update Error:', err);
    res.status(500).json({ msg: (err as Error).message || "Server Error" });
  }
};

export const removeProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    // Remove Picture
    user.picture = null;
    await user.save();

    res.json({
      msg: 'Profile Picture Removed Successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        picture: user.picture,
        notepad: user.notepad
      }
    });
  } catch (err) {
    console.error('Remove Picture Error:', err);
    res.status(500).json({ msg: (err as Error).message || "Server Error" });
  }
};

export const googleCallback = (req: any, res: any) => {
  try {
    // Create JWT Token for the User
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
      { expiresIn: '7d' }
    );

    // Redirect to Frontend with Token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}&email=${encodeURIComponent(req.user.email)}`);
  } catch (err) {
    console.error('Google Callback Error:', err);
    res.redirect(`${process.env.FRONTEND_URL}?error=authentication_failed`);
  }
};
