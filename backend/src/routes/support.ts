import express from 'express';
import { sendSupportEmail } from '../controllers/supportController.js';

const router = express.Router();

// @route   POST /api/support/send
router.post('/send', sendSupportEmail);

export default router;
