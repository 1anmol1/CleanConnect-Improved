import express from 'express';
const router = express.Router();

// Import middleware for security
import { protect, authorize } from '../middleware/authMiddleware.js';

// --- THE FIX IS HERE ---
// 1. Import all the correct controller functions.
//    'markAttendance' has been corrected to 'markOnRoute'.
import { 
    markOnRoute,
    checkOut,
    completeRoute
} from '../controllers/attendanceController.js';

// 2. The route for checking in now correctly uses the 'markOnRoute' function.
router.route('/check-in').post(protect, authorize('Worker'), markOnRoute);

// This route handles checking out (on logout).
router.route('/check-out').post(protect, authorize('Worker'), checkOut);

// This route handles completing a route.
router.route('/complete-route').put(protect, authorize('Worker'), completeRoute);

export default router;