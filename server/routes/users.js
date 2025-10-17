import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';

// Import all controller functions, including the new one for the login page
import { 
  addWorker, 
  getWorkers, 
  getUserStats, 
  getLeaderboard,
  updateWorkerLocation,
  getAllWorkersForLogin,
  getAllCitizensForLogin // <-- Add this
} from '../controllers/userController.js';

// Defines routes for adding and fetching workers
router.route('/workers')
  .get(protect, authorize('Officer'), getWorkers)
  .post(protect, authorize('Officer'), addWorker);

// Defines the route for fetching user profile stats
router.route('/stats').get(protect, getUserStats);

// Defines the route for fetching the community leaderboard
router.route('/leaderboard').get(protect, getLeaderboard);

// --- PUBLIC ROUTES FOR LOGIN PAGE DROPDOWNS ---
router.route('/all-workers').get(getAllWorkersForLogin);
router.route('/all-citizens').get(getAllCitizensForLogin); // <-- New route

// --- ROUTE FOR LIVE WORKER TRACKING ---
router.route('/live-location')
  .put(protect, authorize('Worker'), updateWorkerLocation);

export default router;