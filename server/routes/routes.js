import express from 'express';
import { getMyTodaysRoute } from '../controllers/routeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-today', protect, authorize('Worker'), getMyTodaysRoute);

export default router;