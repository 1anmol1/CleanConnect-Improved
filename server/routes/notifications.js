import express from 'express';
// 1. Import the new 'deleteNotification' function from your controller
import { 
  createNotification, 
  getMyNotifications, 
  sendResolutionNotification,
  deleteNotification // <-- ADD THIS IMPORT
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Officer'), createNotification);
  
router.route('/my-notifications')
  .get(protect, authorize('Citizen', 'Worker'), getMyNotifications);

router.route('/resolution')
    .post(protect, authorize('Officer'), sendResolutionNotification);

// 2. ADD THIS NEW ROUTE DEFINITION
// This tells Express that when it receives a DELETE request to '/api/notifications/:id',
// it should run the 'protect' middleware and then the 'deleteNotification' controller.
router.route('/:id')
  .delete(protect, deleteNotification);

export default router;