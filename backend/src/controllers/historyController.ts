import { Response } from 'express';
import History from '../models/History.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Get User Calculation History
// @access  Private
export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    console.error('Get History Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Add New Calculation to History
// @access  Private
export const addHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { type, expression, result } = req.body;

    const newHistory = new History({
      userId: req.user.id,
      type,
      expression,
      result
    });

    const savedHistory = await newHistory.save();
    res.json(savedHistory);
  } catch (err) {
    console.error('Add History Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Delete Specific History Entry
// @access  Private
export const deleteHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await History.findById(req.params.id);

    if (!history) {
      return res.status(404).json({ msg: "History Not Found" });
    }

    // Make Sure User Owns the History
    if (history.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorized" });
    }

    await History.findByIdAndDelete(req.params.id);
    res.json({ msg: "History Deleted" });
  } catch (err) {
    console.error('Delete History Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Clear All User History
// @access  Private
export const clearHistory = async (req: AuthRequest, res: Response) => {
  try {
    await History.deleteMany({ userId: req.user.id });
    res.json({ msg: "All History Cleared" });
  } catch (err) {
    console.error('Clear History Error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};
