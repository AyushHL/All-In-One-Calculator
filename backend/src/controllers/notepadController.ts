import { Response } from 'express';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Save Notepad Content
// @access  Private
export const saveNotepad = async (req: AuthRequest, res: Response) => {
  try {
    const { note } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notepad: note },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    res.json({ msg: "Notepad Saved", notepad: user.notepad });
  } catch (err) {
    console.error('Save Notepad Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get Notepad Content
// @access  Private
export const getNotepad = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('notepad');
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    res.json({ notepad: user.notepad });
  } catch (err) {
    console.error('Get Notepad Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};
