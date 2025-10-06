import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';

// 1. Import the new 'updateWorkerLocation' function from your controller
import { 
  addWorker, 
  getWorkers, 
  getUserStats, 
  getLeaderboard,
  updateWorkerLocation // The new function
} from '../controllers/userController.js';

// Defines routes for adding and fetching workers
router.route('/workers')
  .get(protect, authorize('Officer'), getWorkers) // GET fetches the list
  .post(protect, authorize('Officer'), addWorker); // POST adds a new worker

// Defines the route for fetching user profile stats
router.route('/stats').get(protect, getUserStats);

// Defines the route for fetching the community leaderboard
router.route('/leaderboard').get(protect, getLeaderboard);


// --- THIS IS THE NEW ROUTE FOR LIVE TRACKING ---
// It handles PUT requests from a worker's device to update their GPS coordinates.
router.route('/live-location')
  .put(protect, authorize('Worker'), updateWorkerLocation);


export default router;