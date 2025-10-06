import express from 'express';
const router = express.Router();

// Import middleware for security
import { protect, authorize } from '../middleware/authMiddleware.js';

// Import the controller function that contains the logic
import { markAttendance } from '../controllers/attendanceController.js';

// Define the route for checking in.
// When a POST request is made to '/api/attendance/check-in', it will first
// verify the user's token (protect), then check if their role is 'Worker' (authorize),
// and finally, run the markAttendance function.
router.route('/check-in').post(protect, authorize('Worker'), markAttendance);

export default router;
