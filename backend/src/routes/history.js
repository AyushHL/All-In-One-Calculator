import express from 'express';
import History from '../models/History.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/history
// @desc    Get user calculation history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/history
// @desc    Add new calculation to history
// @access  Private
router.post('/', auth, async (req, res) => {
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
    console.error('Add history error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete specific history entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const history = await History.findById(req.params.id);
    
    if (!history) {
      return res.status(404).json({ msg: "History not found" });
    }

    // Make sure user owns the history
    if (history.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await History.findByIdAndDelete(req.params.id);
    res.json({ msg: "History deleted" });
  } catch (err) {
    console.error('Delete history error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE /api/history
// @desc    Clear all user history
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user.id });
    res.json({ msg: "All history cleared" });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
