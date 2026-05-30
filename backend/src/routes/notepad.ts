import express from 'express';
import auth from '../middleware/auth.js';
import { saveNotepad, getNotepad } from '../controllers/notepadController.js';

const router = express.Router();

// @route   POST /api/notepad
router.post('/', auth, saveNotepad);

// @route   GET /api/notepad
router.get('/', auth, getNotepad);

export default router;
