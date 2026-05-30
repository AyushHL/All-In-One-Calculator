import express from 'express';
import auth from '../middleware/auth.js';
import { getHistory, addHistory, deleteHistory, clearHistory } from '../controllers/historyController.js';

const router = express.Router();

// @route   GET /api/history
router.get('/', auth, getHistory);

// @route   POST /api/history
router.post('/', auth, addHistory);

// @route   DELETE /api/history/:id
router.delete('/:id', auth, deleteHistory);

// @route   DELETE /api/history
router.delete('/', auth, clearHistory);

export default router;
