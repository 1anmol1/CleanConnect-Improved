import express from 'express';
const router = express.Router();

// --- Middleware ---
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Middleware for handling image uploads

// --- Controller Functions ---
// Import all the functions from your complaint controller
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
  addFeedbackToComplaint
} from '../controllers/complaintController.js';


// --- Route Definitions ---

// Base route: /api/complaints
// GET for Officers to see all complaints.
// POST for Citizens to create a new one (with an image upload).
router.route('/')
  .get(protect, authorize('Officer'), getComplaints)
  .post(protect, authorize('Citizen'), upload.single('photo'), createComplaint);

// Route for a citizen to get their own complaint history
// GET /api/complaints/my-history
router.route('/my-history').get(protect, authorize('Citizen'), getMyComplaints);

// Route for a worker to get their assigned tasks
// GET /api/complaints/my-resolutions
router.route('/my-resolutions').get(protect, authorize('Worker'), getWorkerResolutions);

// Route for an officer to delete multiple complaints at once
// POST /api/complaints/bulk-delete
router.route('/bulk-delete').post(protect, authorize('Officer'), bulkDeleteComplaints);

// Route for a citizen to add feedback to a specific complaint
// PUT /api/complaints/:id/feedback
router.route('/:id/feedback').put(protect, authorize('Citizen'), addFeedbackToComplaint);

// Route for an officer to assign a complaint to a worker
// PUT /api/complaints/:id/assign
router.route('/:id/assign').put(protect, authorize('Officer'), assignComplaint);

// Route for a worker to mark a complaint as resolved (with a proof image)
// PUT /api/complaints/:id/resolve
router.route('/:id/resolve').put(protect, authorize('Worker'), upload.single('resolutionPhoto'), resolveComplaint);

// Route for an officer to verify a resolution (which also notifies the citizen)
// PUT /api/complaints/:id/verify
router.route('/:id/verify').put(protect, authorize('Officer'), verifyAndNotifyComplaint);

// Route for an officer to close a complaint after feedback
// PUT /api/complaints/:id/close
router.route('/:id/close').put(protect, authorize('Officer'), closeComplaint);


export default router;

