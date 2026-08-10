import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

import {
  getComplaints,
  createComplaint,
  assignComplaint,
  resolveComplaint,
  verifyAndNotifyComplaint,
  closeComplaint,
  getMyComplaints,
  bulkDeleteComplaints,
  getWorkerResolutions,
  addFeedbackToComplaint,
  voteOnComplaint,
  getWorkerProgress,
  getOfficerProgress // <-- Make sure this is imported
} from '../controllers/complaintController.js';

// --- PUBLIC ROUTES ---
router.route('/officer-progress').get(getOfficerProgress); // <-- THIS IS THE MISSING ROUTE

// --- PROTECTED ROUTES ---
router.route('/')
  .get(protect, authorize('Officer', 'Citizen'), getComplaints)
  .post(protect, authorize('Citizen'), upload.single('photo'), createComplaint);

router.route('/my-history').get(protect, authorize('Citizen'), getMyComplaints);
router.route('/my-resolutions').get(protect, authorize('Worker'), getWorkerResolutions);
router.route('/bulk-delete').post(protect, authorize('Officer'), bulkDeleteComplaints);
router.route('/progress').get(protect, authorize('Officer'), getWorkerProgress);

// Routes with ID parameter
router.route('/:id/vote').put(protect, authorize('Citizen'), voteOnComplaint);
router.route('/:id/feedback').put(protect, authorize('Citizen'), addFeedbackToComplaint);
router.route('/:id/assign').put(protect, authorize('Officer'), assignComplaint);
router.route('/:id/resolve').put(protect, authorize('Worker'), upload.single('resolutionPhoto'), resolveComplaint);
router.route('/:id/verify').put(protect, authorize('Officer'), verifyAndNotifyComplaint);
router.route('/:id/close').put(protect, authorize('Officer'), closeComplaint);

export default router;
