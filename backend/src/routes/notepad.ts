import express, { Response } from 'express';
import User from '../models/User.js';
import auth, { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/notepad
// @desc    Save notepad content
// @access  Private
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { note } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notepad: note },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Notepad saved", notepad: user.notepad });
  } catch (err) {
    console.error('Save notepad error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/notepad
// @desc    Get notepad content
// @access  Private
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('notepad');
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ notepad: user.notepad });
  } catch (err) {
    console.error('Get notepad error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
