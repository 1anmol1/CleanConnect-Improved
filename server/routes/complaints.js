import express from 'express';
import { 
    createComplaint, 
    getComplaints, 
    getMyResolutions,
    assignComplaint,
    resolveComplaint,
    verifyResolution,
    submitFeedback,
    getMyComplaints,
    closeComplaint,
    deleteComplaints,
    reassignComplaint
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/bulk-delete')
    .post(protect, authorize('Officer'), deleteComplaints);

router.route('/')
    .post(protect, upload.single('photo'), createComplaint)
    .get(protect, authorize('Officer'), getComplaints);

router.route('/my-resolutions')
    .get(protect, authorize('Worker'), getMyResolutions);

router.route('/my-history')
    .get(protect, authorize('Citizen'), getMyComplaints);

router.route('/:id/assign')
    .put(protect, authorize('Officer'), assignComplaint);

router.route('/:id/resolve')
    .put(protect, authorize('Worker'), upload.single('resolutionPhoto'), resolveComplaint);

router.route('/:id/verify')
    .put(protect, authorize('Officer'), verifyResolution);

router.route('/:id/feedback')
    .put(protect, authorize('Citizen'), submitFeedback);

router.route('/:id/close')
    .put(protect, authorize('Officer'), closeComplaint);

router.route('/:id/reassign')
    .put(protect, authorize('Officer'), reassignComplaint);

export default router;