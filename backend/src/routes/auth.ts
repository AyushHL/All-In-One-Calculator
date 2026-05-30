import express from 'express';
import passport from 'passport';
import multer from 'multer';
import auth from '../middleware/auth.js';
import {
  register,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  removeProfilePicture,
  googleCallback
} from '../controllers/authController.js';

const router = express.Router();

// Configure Multer for File Uploads (Memory Storage - Files Stored as Base64 in DB)
const storage = multer.memoryStorage();

// File Filter for Images Only
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only Image Files Are Allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', auth, upload.single('picture'), updateProfile);
router.delete('/profile/picture', auth, removeProfilePicture);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

export default router;
