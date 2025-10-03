import express from 'express';
import { handleChat, handleGuestChat } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is for logged-in users and is now protected by the middleware.
router.post('/chat', protect, handleChat);

// This route is for guest users and has no protection.
router.post('/guest-chat', handleGuestChat);

export default router;