import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';

// Import all the controller functions
import {
  getComplaints,
  createComplaint,
  assignComplaint,
  resolveComplaint,
  verifyAndNotifyComplaint, // The new combined function
  closeComplaint,
  getMyComplaints,
  bulkDeleteComplaints
} from '../controllers/complaintController.js';

// Setup routes

// Officer: Get all complaints. Citizen: Create a new one.
router.route('/')
  .get(protect, authorize('Officer'), getComplaints)
  .post(protect, authorize('Citizen'), createComplaint);

// Citizen: Get their own complaint history
router.route('/my-history').get(protect, getMyComplaints);

// Officer: Bulk delete selected complaints
router.route('/bulk-delete').post(protect, authorize('Officer'), bulkDeleteComplaints);

// Officer: Assign a complaint
router.route('/:id/assign').put(protect, authorize('Officer'), assignComplaint);

// Worker: Resolve a complaint
router.route('/:id/resolve').put(protect, authorize('Worker'), resolveComplaint);

// Officer: Verify a resolution AND notify the citizen
router.route('/:id/verify').put(protect, authorize('Officer'), verifyAndNotifyComplaint);

// Officer: Close a complaint
router.route('/:id/close').put(protect, authorize('Officer'), closeComplaint);

export default router;
