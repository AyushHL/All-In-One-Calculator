import { Response } from 'express';
import Note from '../models/Note.js';
import { AuthRequest } from '../middleware/auth.js';

// Get all Notes for Logged-in User
export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error Fetching Notes:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new Note
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and Content are Required' });
    }

    const note = new Note({
      userId: req.user.id,
      title,
      content
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Error Creating Note:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a Note
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note Not Found' });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error Updating Note:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a Note
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note Not Found' });
    }

    res.json({ message: 'Note Deleted Successfully' });
  } catch (error) {
    console.error('Error Deleting Note:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
