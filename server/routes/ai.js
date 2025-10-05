import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { processChatMessage } from '../controllers/aiController.js'; // Updated function name

// The endpoint remains the same, but it's now connected to a real AI brain
router.route('/chat').post(protect, processChatMessage);

export default router;