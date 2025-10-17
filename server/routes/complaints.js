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
  voteOnComplaint // <-- Import new function
} from '../controllers/complaintController.js';

router.route('/')
  .get(protect, authorize('Officer'), getComplaints)
  .post(protect, authorize('Citizen'), upload.single('photo'), createComplaint);

router.route('/my-history').get(protect, authorize('Citizen'), getMyComplaints);
router.route('/my-resolutions').get(protect, authorize('Worker'), getWorkerResolutions);
router.route('/bulk-delete').post(protect, authorize('Officer'), bulkDeleteComplaints);

// New route for voting
router.route('/:id/vote').put(protect, authorize('Citizen'), voteOnComplaint);

router.route('/:id/feedback').put(protect, authorize('Citizen'), addFeedbackToComplaint);
router.route('/:id/assign').put(protect, authorize('Officer'), assignComplaint);
router.route('/:id/resolve').put(protect, authorize('Worker'), upload.single('resolutionPhoto'), resolveComplaint);
router.route('/:id/verify').put(protect, authorize('Officer'), verifyAndNotifyComplaint);
router.route('/:id/close').put(protect, authorize('Officer'), closeComplaint);

export default router;