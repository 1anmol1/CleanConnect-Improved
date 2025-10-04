import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getMyNotifications,
  deleteNotification,
  createNotification,
  sendResolutionNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Officer: Broadcast notification
router.post('/', protect, authorize('Officer'), createNotification);

// Officer: Send notification for complaint resolution
router.post('/send-resolution', protect, authorize('Officer'), sendResolutionNotification);

// Any user: Get their notifications
router.get('/my-notifications', protect, getMyNotifications);

// Any user: Delete their notification
router.delete('/:id', protect, deleteNotification);

export default router;