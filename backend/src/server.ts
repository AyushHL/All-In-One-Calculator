import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { setupPassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import notepadRoutes from './routes/notepad.js';
import notesRoutes from './routes/notes.js';
import supportRoutes from './routes/support.js';

// Load Environment Variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust Reverse Proxy (Required for Rate Limiting to work correctly on Azure)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 1000,                // Limit each IP to 1000 Requests per `window` (here, per 15 minutes)
  message: 'Too many Requests from this IP, Please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Specific Stricter rate limit for Auth Routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                  // Limit each IP to 20 Auth Requests per hour
  message: 'Too many Authentication Attempts, Please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Session Middleware (Required for Passport)
app.use(
  session({
    secret: process.env.JWT_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
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

// Health Check Route
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', message: 'Server is Running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});
