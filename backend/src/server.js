import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { setupPassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import notepadRoutes from './routes/notepad.js';
import notesRoutes from './routes/notes.js';
import supportRoutes from './routes/support.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.JWT_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notepad', notepadRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/support', supportRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
