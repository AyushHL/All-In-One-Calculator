import express from 'express';
import auth from '../middleware/auth.js';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notesController.js';

const router = express.Router();

router.get('/', auth, getNotes);
router.post('/', auth, createNote);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

export default router;
